import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
}

export async function GET(request: Request): Promise<NextResponse> {
  const incoming = new URL(request.url);
  const upstream = new URL("/orders/export.csv", resolveApiUrl());

  const allowed = ["status", "payment_state", "q", "created_from", "created_to"];
  for (const key of allowed) {
    const value = incoming.searchParams.get(key);
    if (value) {
      upstream.searchParams.set(key, value);
    }
  }

  const response = await fetch(upstream.toString(), { cache: "no-store" });
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
        response.headers.get("content-disposition") ?? 'attachment; filename="orders-export.csv"'
    }
  });
}
