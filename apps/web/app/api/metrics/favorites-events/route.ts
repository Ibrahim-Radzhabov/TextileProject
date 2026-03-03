import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://localhost:8000";
}

export async function POST(request: Request): Promise<NextResponse> {
  const response = await fetch(`${resolveApiUrl().replace(/\/+$/, "")}/metrics/favorites-events`, {
    method: "POST",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json"
    },
    body: await request.text(),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({ detail: "Invalid upstream response" }));
  return NextResponse.json(payload, { status: response.status });
}
