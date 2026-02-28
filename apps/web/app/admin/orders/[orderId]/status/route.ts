import { NextResponse } from "next/server";

type RouteParams = {
  params: {
    orderId: string;
  };
};

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
}

function buildOrderDetailsRedirectUrl(baseUrl: URL, options: {
  orderId: string;
  processingStatus?: string | null;
  offset?: string | null;
  statusAuditTo?: string | null;
  statusAuditActor?: string | null;
  statusAuditSort?: string | null;
  statusAuditOffset?: string | null;
  actionError?: string | null;
}): URL {
  const redirect = new URL(`/admin/orders/${encodeURIComponent(options.orderId)}`, baseUrl);
  if (options.processingStatus) {
    redirect.searchParams.set("processing_status", options.processingStatus);
  }
  if (options.offset) {
    redirect.searchParams.set("offset", options.offset);
  }
  if (options.statusAuditTo) {
    redirect.searchParams.set("status_audit_to", options.statusAuditTo);
  }
  if (options.statusAuditActor) {
    redirect.searchParams.set("status_audit_actor", options.statusAuditActor);
  }
  if (options.statusAuditSort) {
    redirect.searchParams.set("status_audit_sort", options.statusAuditSort);
  }
  if (options.statusAuditOffset) {
    redirect.searchParams.set("status_audit_offset", options.statusAuditOffset);
  }
  if (options.actionError) {
    redirect.searchParams.set("action_error", options.actionError);
  }
  return redirect;
}

function resolveOrdersListReturnUrl(baseUrl: URL, value: FormDataEntryValue | null): URL | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized.startsWith("/")) {
    return null;
  }

  const candidate = new URL(normalized, baseUrl);
  if (candidate.origin !== baseUrl.origin || candidate.pathname !== "/admin/orders") {
    return null;
  }

  candidate.searchParams.delete("action_error");
  candidate.searchParams.delete("action_success");
  return candidate;
}

function addFlashParam(url: URL, key: "action_error" | "action_success", message: string): URL {
  const redirect = new URL(url.toString());
  redirect.searchParams.set(key, message);
  return redirect;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const formData = await request.formData();
  const baseUrl = new URL(request.url);
  const status = String(formData.get("status") ?? "").trim();
  const reasonRaw = String(formData.get("reason") ?? "").trim();
  const processingStatus = formData.get("processing_status");
  const offset = formData.get("offset");
  const statusAuditTo = formData.get("status_audit_to");
  const statusAuditActor = formData.get("status_audit_actor");
  const statusAuditSort = formData.get("status_audit_sort");
  const statusAuditOffset = formData.get("status_audit_offset");
  const returnTo = resolveOrdersListReturnUrl(baseUrl, formData.get("return_to"));
  const reason = reasonRaw.length ? reasonRaw : undefined;
  if (!status) {
    if (returnTo) {
      return NextResponse.redirect(addFlashParam(returnTo, "action_error", "Выберите новый статус."), 303);
    }
    const redirect = buildOrderDetailsRedirectUrl(baseUrl, {
      orderId: params.orderId,
      processingStatus: typeof processingStatus === "string" ? processingStatus : null,
      offset: typeof offset === "string" ? offset : null,
      statusAuditTo: typeof statusAuditTo === "string" ? statusAuditTo : null,
      statusAuditActor: typeof statusAuditActor === "string" ? statusAuditActor : null,
      statusAuditSort: typeof statusAuditSort === "string" ? statusAuditSort : null,
      statusAuditOffset: typeof statusAuditOffset === "string" ? statusAuditOffset : null,
      actionError: "Выберите новый статус."
    });
    return NextResponse.redirect(redirect, 303);
  }

  const upstream = new URL(`/orders/${encodeURIComponent(params.orderId)}/status`, resolveApiUrl());
  const response = await fetch(upstream.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status,
      reason
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: unknown } | null;
    const detail =
      typeof payload?.detail === "string" ? payload.detail : "Не удалось обновить статус заказа.";

    if (returnTo) {
      return NextResponse.redirect(addFlashParam(returnTo, "action_error", detail), 303);
    }

    const redirect = buildOrderDetailsRedirectUrl(baseUrl, {
      orderId: params.orderId,
      processingStatus: typeof processingStatus === "string" ? processingStatus : null,
      offset: typeof offset === "string" ? offset : null,
      statusAuditTo: typeof statusAuditTo === "string" ? statusAuditTo : null,
      statusAuditActor: typeof statusAuditActor === "string" ? statusAuditActor : null,
      statusAuditSort: typeof statusAuditSort === "string" ? statusAuditSort : null,
      statusAuditOffset: typeof statusAuditOffset === "string" ? statusAuditOffset : null,
      actionError: detail
    });
    return NextResponse.redirect(redirect, 303);
  }

  if (returnTo) {
    return NextResponse.redirect(
      addFlashParam(returnTo, "action_success", `Статус обновлён: ${status}.`),
      303
    );
  }

  const redirect = buildOrderDetailsRedirectUrl(baseUrl, {
    orderId: params.orderId,
    processingStatus: typeof processingStatus === "string" ? processingStatus : null,
    offset: typeof offset === "string" ? offset : null,
    statusAuditTo: typeof statusAuditTo === "string" ? statusAuditTo : null,
    statusAuditActor: typeof statusAuditActor === "string" ? statusAuditActor : null,
    statusAuditSort: typeof statusAuditSort === "string" ? statusAuditSort : null,
    statusAuditOffset: typeof statusAuditOffset === "string" ? statusAuditOffset : null
  });
  return NextResponse.redirect(redirect, 303);
}
