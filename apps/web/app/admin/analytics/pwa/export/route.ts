import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
}

function resolveAdminHeaders(): HeadersInit | undefined {
  const token = process.env.ADMIN_TOKEN?.trim();
  if (!token) {
    return undefined;
  }
  return {
    "x-admin-token": token
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const incoming = new URL(request.url);
  const upstream = new URL("/metrics/pwa-install-events/export.csv", resolveApiUrl());

  const allowed = ["metric", "path_prefix", "date_from", "date_to", "sort"];
  for (const key of allowed) {
    const value = incoming.searchParams.get(key);
    if (value) {
      upstream.searchParams.set(key, value);
    }
  }

  const response = await fetch(upstream.toString(), {
    cache: "no-store",
    headers: resolveAdminHeaders()
  });
  const body = await response.text();

  if (!response.ok) {
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json; charset=utf-8"
      }
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "text/csv; charset=utf-8",
      "Content-Disposition":
        response.headers.get("content-disposition") ?? 'attachment; filename="pwa-install-events.csv"'
    }
  });
}
