import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_DEFAULT_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_LOGOUT_PATH,
  resolveRequestUrl,
  sanitizeAdminNextPath
} from "@/lib/admin-auth";

function extractBearerToken(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

export function middleware(request: NextRequest) {
  const requestUrl = resolveRequestUrl(request);
  const { pathname, searchParams, protocol } = requestUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const queryToken = searchParams.get("token");

  if (queryToken) {
    const cleanUrl = new URL(requestUrl.toString());
    cleanUrl.searchParams.delete("token");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: queryToken,
      path: "/admin",
      httpOnly: true,
      sameSite: "lax",
      secure: protocol === "https:",
      maxAge: 60 * 60 * 12
    });
    return response;
  }

  const expectedToken = process.env.ADMIN_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.next();
  }

  const headerToken = request.headers.get("x-admin-token") ?? extractBearerToken(request.headers.get("authorization"));
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const providedToken = queryToken ?? headerToken ?? cookieToken ?? null;
  const isLoginPath = pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  const isLogoutPath = pathname === ADMIN_LOGOUT_PATH;
  const hasValidCookie = cookieToken === expectedToken;

  if ((isLoginPath || isLogoutPath) && providedToken !== expectedToken) {
    return NextResponse.next();
  }

  if (providedToken !== expectedToken) {
    const nextPath = sanitizeAdminNextPath(`${pathname}${requestUrl.search}`);
    const loginUrl = new URL(requestUrl.toString());
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.search = "";
    if (nextPath) {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && hasValidCookie && !queryToken) {
    const redirectTarget = sanitizeAdminNextPath(searchParams.get("next")) ?? ADMIN_DEFAULT_PATH;
    const redirectUrl = new URL(requestUrl.toString());
    redirectUrl.pathname = redirectTarget;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  const shouldPersistCookie = cookieToken !== expectedToken;
  if (shouldPersistCookie) {
    const response = NextResponse.next();
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: expectedToken,
      path: "/admin",
      httpOnly: true,
      sameSite: "lax",
      secure: protocol === "https:",
      maxAge: 60 * 60 * 12
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
