"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  { label: "SALES", href: "/catalog?sale=true" },
  { label: "WOMAN", href: "/catalog?segment=woman" },
  { label: "MAN", href: "/catalog?segment=man" },
  { label: "COLLECTIONS", href: "/catalog?segment=collections" },
  { label: "ABOUT AGNONA", href: "/about" }
];

export function SidebarMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }

    return undefined;
  }, [isOpen]);

  return (
    <>
      {/* Кнопка-триггер внизу слева, визуально напротив док-станции */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed left-4 top-24 z-[60] inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground shadow-soft-subtle backdrop-blur-sm transition-colors hover:border-border hover:bg-background md:left-10 md:top-24"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {!isOpen ? (
          <>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Menu</span>
          </>
        ) : (
          <>
            <span>Close</span>
            <svg className="h-3 w-3 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </>
        )}
      </button>

      {/* Overlay */}
      <button
        type="button"
        className={`fixed inset-0 z-[58] bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
        onClick={() => setIsOpen(false)}
      />

      {/* Выезжающая панель слева */}
      <aside
        className={`fixed left-0 top-0 z-[59] flex h-full w-[360px] max-w-[82vw] flex-col bg-[#f4f4f4] shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Основная навигация"
      >
        <div className="flex h-16 items-center px-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-gray-900 transition-colors hover:text-gray-600"
          >
            Close
            <svg className="h-3 w-3 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-6 pb-8">
          <ul className="divide-y divide-gray-200">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href.split("?")[0];
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between py-4 text-[13px] font-semibold tracking-[0.16em] text-gray-900 transition-colors hover:text-gray-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={isActive ? "text-gray-700" : ""}>{item.label}</span>
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

