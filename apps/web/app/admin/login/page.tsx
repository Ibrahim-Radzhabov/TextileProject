"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Surface } from "@store-platform/ui";
import {
  ADMIN_DEFAULT_PATH,
  sanitizeAdminNextPath
} from "@/lib/admin-auth";

const adminLoginSchema = z.object({
  token: z.string().min(3, "Введите admin token")
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      token: ""
    }
  });

  const onSubmit = (values: AdminLoginValues) => {
    setSubmitting(true);

    const nextPath = sanitizeAdminNextPath(searchParams.get("next")) ?? ADMIN_DEFAULT_PATH;
    const separator = nextPath.includes("?") ? "&" : "?";
    router.replace(`${nextPath}${separator}token=${encodeURIComponent(values.token)}`);
  };

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-md items-center">
      <Surface tone="subtle" className="w-full space-y-5 px-5 py-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Admin вход</h1>
          <p className="text-sm text-muted-foreground">
            Введите токен доступа для панели заказов.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="admin-token">
              Admin token
            </label>
            <input
              id="admin-token"
              type="password"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-border/60 bg-input px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring"
              {...register("token")}
            />
            {errors.token && (
              <p className="text-xs text-red-400">{errors.token.message}</p>
            )}
          </div>

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? "Проверка…" : "Войти"}
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
