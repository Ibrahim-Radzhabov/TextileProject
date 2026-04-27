export const ADMIN_COOKIE_NAME = "store_platform_admin_token";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_LOGOUT_PATH = "/admin/logout";
export const ADMIN_DEFAULT_PATH = "/admin/orders";

type RequestLike = {
  headers: Headers;
  url: string;
};

function resolveProtocolFromHost(host: string | null | undefined, fallbackProtocol: string): string {
  if (!host) {
    return fallbackProtocol;
  }

  const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
  ) {
    return "http";
  }

  return fallbackProtocol;
}

export function resolveRequestUrl(request: RequestLike): URL {
  const rawUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const fallbackProtocol = rawUrl.protocol.replace(/:$/, "") || "https";
  const protocol = forwardedProto ?? resolveProtocolFromHost(host, fallbackProtocol);

  if (!host) {
    return rawUrl;
  }

  try {
    return new URL(`${protocol}://${host}${rawUrl.pathname}${rawUrl.search}`);
  } catch {
    return rawUrl;
  }
}

export function sanitizeAdminNextPath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith("/admin")) {
    return null;
  }
  if (value.startsWith(ADMIN_LOGIN_PATH) || value.startsWith(ADMIN_LOGOUT_PATH)) {
    return null;
  }
  return value;
}
