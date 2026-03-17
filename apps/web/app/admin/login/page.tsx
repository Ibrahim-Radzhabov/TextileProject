import Link from "next/link";
import { Button, Surface } from "@store-platform/ui";
import {
  ADMIN_DEFAULT_PATH,
  sanitizeAdminNextPath
} from "@/lib/admin-auth";

type AdminLoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function readSearchParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : null;
  }
  return null;
}

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const nextPath =
    sanitizeAdminNextPath(readSearchParam(searchParams?.next)) ??
    ADMIN_DEFAULT_PATH;
  const errorMessage = readSearchParam(searchParams?.error);

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-md items-center">
      <Surface tone="subtle" className="w-full space-y-5 px-5 py-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Admin вход</h1>
          <p className="text-sm text-muted-foreground">
            Введите токен доступа для панели управления.
          </p>
        </div>

        <form className="space-y-4" action="/admin/login/submit" method="post">
          <input type="hidden" name="next" value={nextPath} />

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-token">
              Admin token
            </label>
            <input
              id="admin-token"
              name="token"
              type="password"
              autoComplete="off"
              minLength={3}
              required
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
            />
          </div>

          {errorMessage ? (
            <p className="text-xs text-red-400">{errorMessage}</p>
          ) : null}

          <Button type="submit" fullWidth>
            Войти
          </Button>
        </form>

        <Link
          href="/"
          className="inline-block text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          ← На витрину
        </Link>
      </Surface>
    </div>
  );
}
