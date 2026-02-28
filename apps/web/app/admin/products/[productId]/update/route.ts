import { NextResponse } from "next/server";
import {
  buildAdminApiHeaders,
  buildProductPayloadFromFormData,
  resolveStoreApiUrl,
} from "@/lib/admin-products";

type RouteParams = {
  params: {
    productId: string;
  };
};

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

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const formData = await request.formData();
  const baseUrl = new URL(request.url);
  const returnTo = resolveProductsReturnUrl(baseUrl, formData.get("return_to"));

  let payload;
  try {
    payload = buildProductPayloadFromFormData(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Некорректные данные товара.";
    return NextResponse.redirect(addFlash(returnTo, "action_error", message), 303);
  }

  const response = await fetch(
    new URL(`/catalog/products/${encodeURIComponent(params.productId)}`, resolveStoreApiUrl()),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...buildAdminApiHeaders(),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const detail = parseApiDetail(await response.json().catch(() => null));
    return NextResponse.redirect(
      addFlash(returnTo, "action_error", detail ?? "Не удалось сохранить изменения товара."),
      303
    );
  }

  return NextResponse.redirect(addFlash(returnTo, "action_success", "Товар обновлен."), 303);
}
