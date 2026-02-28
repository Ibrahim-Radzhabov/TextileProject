import { NextResponse } from "next/server";

type RouteParams = {
  params: {
    orderId: string;
  };
};

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
}

function buildRedirectUrl(baseUrl: URL, options: {
  orderId: string;
  processingStatus?: string | null;
  offset?: string | null;
  actionError?: string | null;
}): URL {
  const redirect = new URL(`/admin/orders/${encodeURIComponent(options.orderId)}`, baseUrl);
  if (options.processingStatus) {
    redirect.searchParams.set("processing_status", options.processingStatus);
  }
  if (options.offset) {
    redirect.searchParams.set("offset", options.offset);
  }
  if (options.actionError) {
    redirect.searchParams.set("action_error", options.actionError);
  }
  return redirect;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const formData = await request.formData();
  const status = String(formData.get("status") ?? "").trim();
  const reasonRaw = String(formData.get("reason") ?? "").trim();
  const processingStatus = formData.get("processing_status");
  const offset = formData.get("offset");
  const reason = reasonRaw.length ? reasonRaw : undefined;

  const baseUrl = new URL(request.url);
  if (!status) {
    const redirect = buildRedirectUrl(baseUrl, {
      orderId: params.orderId,
      processingStatus: typeof processingStatus === "string" ? processingStatus : null,
      offset: typeof offset === "string" ? offset : null,
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

    const redirect = buildRedirectUrl(baseUrl, {
      orderId: params.orderId,
      processingStatus: typeof processingStatus === "string" ? processingStatus : null,
      offset: typeof offset === "string" ? offset : null,
      actionError: detail
    });
    return NextResponse.redirect(redirect, 303);
  }

  const redirect = buildRedirectUrl(baseUrl, {
    orderId: params.orderId,
    processingStatus: typeof processingStatus === "string" ? processingStatus : null,
    offset: typeof offset === "string" ? offset : null
  });
  return NextResponse.redirect(redirect, 303);
}
