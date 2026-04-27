import { NextResponse } from "next/server";

function resolveApiUrl(): string {
  return process.env.STORE_API_URL ?? process.env.NEXT_PUBLIC_STORE_API_URL ?? "http://127.0.0.1:8000";
}

function buildUpstreamUrl(requestUrl: string): string {
  const incoming = new URL(requestUrl);
  const upstream = new URL("/favorites/sync", resolveApiUrl());
  const syncId = incoming.searchParams.get("sync_id");
  if (syncId) {
    upstream.searchParams.set("sync_id", syncId);
  }
  return upstream.toString();
}

async function forwardGet(request: Request): Promise<NextResponse> {
  const response = await fetch(buildUpstreamUrl(request.url), {
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({ detail: "Invalid upstream response" }));
  return NextResponse.json(payload, { status: response.status });
}

async function forwardPut(request: Request): Promise<NextResponse> {
  const response = await fetch(buildUpstreamUrl(request.url), {
    method: "PUT",
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json"
    },
    body: await request.text(),
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({ detail: "Invalid upstream response" }));
  return NextResponse.json(payload, { status: response.status });
}

export async function GET(request: Request): Promise<NextResponse> {
  return forwardGet(request);
}

export async function PUT(request: Request): Promise<NextResponse> {
  return forwardPut(request);
}
