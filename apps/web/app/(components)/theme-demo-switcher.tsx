"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ThemeConfig } from "@store-platform/shared-types";
import { resolveThemeVariants, THEME_VARIANT_COOKIE } from "@/lib/theme-variants";

type ThemeDemoSwitcherProps = {
  theme: ThemeConfig;
  activeVariantId: string;
};

export function ThemeDemoSwitcher({ theme, activeVariantId }: ThemeDemoSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const variants = useMemo(() => resolveThemeVariants(theme), [theme]);

  if (variants.length <= 1) {
    return null;
  }

  const applyVariant = (variantId: string) => {
    document.cookie = `${THEME_VARIANT_COOKIE}=${encodeURIComponent(variantId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-border/55 bg-card/30 p-1 lg:flex">
      {variants.map((variant) => {
        const active = variant.id === activeVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => applyVariant(variant.id)}
            disabled={isPending}
            className={[
              "rounded-full px-2.5 py-1 text-[11px] transition-colors",
              active
                ? "border border-accent/70 bg-accent/15 text-foreground"
                : "border border-transparent text-muted-foreground hover:border-accent/40 hover:text-foreground"
            ].join(" ")}
          >
            {variant.name}
          </button>
        );
      })}
    </div>
  );
}
