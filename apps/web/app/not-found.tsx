import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">404</p>
      <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,3.2rem)] font-normal leading-tight tracking-tight">
        Страница не найдена
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Возможно, она была перемещена или удалена. Вернитесь на главную или загляните в каталог.
      </p>
      <div className="mt-8 flex gap-6">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
        >
          Главная
        </Link>
        <Link
          href="/catalog"
          className="text-[11px] uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-foreground"
        >
          Каталог
        </Link>
      </div>
    </div>
  );
}
