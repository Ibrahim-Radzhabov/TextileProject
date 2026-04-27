import { NextResponse } from "next/server";
import { resolveRequestUrl } from "@/lib/admin-auth";
import { buildAdminApiHeaders, resolveStoreApiUrl } from "@/lib/admin-products";

type BulkAction = "activate" | "deactivate" | "sort_up" | "sort_down";

function resolveProductsReturnUrl(baseUrl: URL, value: FormDataEntryValue | null): URL {
  if (typeof value !== "string") {
    return new URL("/admin/products", baseUrl);
  }
  const normalized = value.trim();
  if (!normalized.startsWith("/")) {
    return new URL("/admin/products", baseUrl);
  }

  const candidate = new URL(normalized, baseUrl);
  if (candidate.origin !== baseUrl.origin || !candidate.pathname.startsWith("/admin/products")) {
    return new URL("/admin/products", baseUrl);
  }

  candidate.searchParams.delete("action_error");
  candidate.searchParams.delete("action_success");
  return candidate;
}

function addFlash(url: URL, key: "action_error" | "action_success", message: string): URL {
  const next = new URL(url.toString());
  next.searchParams.set(key, message);
  return next;
}

function parseApiDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const detail = (payload as { detail?: unknown }).detail;
  return typeof detail === "string" ? detail : null;
}

function parseBulkAction(value: FormDataEntryValue | null): BulkAction | null {
  if (typeof value !== "string") {
    return null;
  }
  if (value === "activate" || value === "deactivate" || value === "sort_up" || value === "sort_down") {
    return value;
  }
  return null;
}

function parseProductIds(formData: FormData): string[] {
  const raw = formData.getAll("product_ids");
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const value of raw) {
    if (typeof value !== "string") {
      continue;
    }
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    ids.push(normalized);
  }

  return ids;
}

function buildBulkPayload(action: BulkAction, productIds: string[]): {
  action: "set_active" | "set_inactive" | "sort_order_delta";
  product_ids: string[];
  sort_order_delta?: number;
} {
  if (action === "activate") {
    return {
      action: "set_active",
      product_ids: productIds,
    };
  }

  if (action === "deactivate") {
    return {
      action: "set_inactive",
      product_ids: productIds,
    };
  }

  if (action === "sort_up") {
    return {
      action: "sort_order_delta",
      product_ids: productIds,
      sort_order_delta: -10,
    };
  }

  return {
    action: "sort_order_delta",
    product_ids: productIds,
    sort_order_delta: 10,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const baseUrl = resolveRequestUrl(request);
  const returnTo = resolveProductsReturnUrl(baseUrl, formData.get("return_to"));

  const action = parseBulkAction(formData.get("bulk_action"));
  if (!action) {
    return NextResponse.redirect(addFlash(returnTo, "action_error", "Некорректное массовое действие."), 303);
  }

  const productIds = parseProductIds(formData);
  if (productIds.length === 0) {
    return NextResponse.redirect(addFlash(returnTo, "action_error", "Выберите товары для массового действия."), 303);
  }

  const payload = buildBulkPayload(action, productIds);
  const response = await fetch(new URL("/catalog/products/bulk", resolveStoreApiUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAdminApiHeaders(request),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = parseApiDetail(await response.json().catch(() => null));
    return NextResponse.redirect(
      addFlash(returnTo, "action_error", detail ?? "Не удалось применить массовое действие."),
      303
    );
  }

  const data = (await response.json().catch(() => null)) as { updated?: unknown } | null;
  const updated = typeof data?.updated === "number" ? data.updated : productIds.length;

  return NextResponse.redirect(addFlash(returnTo, "action_success", `Обновлено товаров: ${updated}.`), 303);
}
