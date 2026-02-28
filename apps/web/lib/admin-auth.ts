export const ADMIN_COOKIE_NAME = "store_platform_admin_token";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_LOGOUT_PATH = "/admin/logout";
export const ADMIN_DEFAULT_PATH = "/admin/orders";

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
