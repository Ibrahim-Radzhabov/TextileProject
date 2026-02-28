import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_LOGIN_PATH } from "@/lib/admin-auth";

function clearAdminCookie(response: NextResponse, secure: boolean) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    path: "/admin",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 0
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  const response = NextResponse.redirect(loginUrl);
  clearAdminCookie(response, loginUrl.protocol === "https:");
  return response;
}

export async function POST(request: Request): Promise<NextResponse> {
  return GET(request);
}
