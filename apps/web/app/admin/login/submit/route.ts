import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_DEFAULT_PATH,
  ADMIN_LOGIN_PATH,
  resolveRequestUrl,
  sanitizeAdminNextPath
} from "@/lib/admin-auth";

function buildLoginRedirect(baseUrl: URL, nextPath: string, errorMessage: string): URL {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, baseUrl);
  loginUrl.searchParams.set("next", nextPath);
  loginUrl.searchParams.set("error", errorMessage);
  return loginUrl;
}

export async function POST(request: Request): Promise<NextResponse> {
  const formData = await request.formData();
  const baseUrl = resolveRequestUrl(request);
  const rawNext = formData.get("next");
  const rawToken = formData.get("token");
  const nextPath =
    sanitizeAdminNextPath(typeof rawNext === "string" ? rawNext : null) ??
    ADMIN_DEFAULT_PATH;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (token.length < 3) {
    return NextResponse.redirect(buildLoginRedirect(baseUrl, nextPath, "Введите admin token."), 303);
  }

  const expectedToken = process.env.ADMIN_TOKEN?.trim();
  if (expectedToken && token !== expectedToken) {
    return NextResponse.redirect(buildLoginRedirect(baseUrl, nextPath, "Неверный admin token."), 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, baseUrl), 303);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    path: "/admin",
    httpOnly: true,
    sameSite: "lax",
    secure: baseUrl.protocol === "https:",
    maxAge: 60 * 60 * 12
  });
  return response;
}
