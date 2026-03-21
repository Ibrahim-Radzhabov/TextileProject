"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./top-nav-search-filter.module.css";

export type TopNavSearchIntensity = "balanced" | "vivid";

type TopNavSearchFilterProps = {
  intensity?: TopNavSearchIntensity;
  className?: string;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state should change (e.g. close) */
  onOpenChange?: (open: boolean) => void;
  /** When true, do not render the trigger button (use with controlled open) */
  hideTrigger?: boolean;
};

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function buildCatalogHref(searchText: string, openFilters: boolean): string {
  const params = new URLSearchParams();
  const query = normalizeQuery(searchText);

  if (query.length > 0) {
    params.set("q", query);
  }
  if (openFilters) {
    params.set("open_filters", "1");
  }

  const suffix = params.toString();
  return suffix.length > 0 ? `/catalog?${suffix}` : "/catalog";
}

export function TopNavSearchFilter({
  intensity = "balanced",
  className,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false
}: TopNavSearchFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setInternalOpen(next);
      }
    },
    [isControlled, onOpenChange]
  );
  const [value, setValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryFromUrl = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  useEffect(() => {
    if (pathname === "/catalog" && queryFromUrl.trim().length > 0) {
      setValue(queryFromUrl);
    }
  }, [pathname, queryFromUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const openSearch = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const submitSearch = useCallback(
    (openFilters: boolean) => {
      const href = buildCatalogHref(value, openFilters);
      router.push(href);
      setOpen(false);
    },
    [router, value]
  );

  return (
    <div
      ref={rootRef}
      className={[
        styles.container,
        hideTrigger && !open ? styles.containerCollapsed : "",
        !hideTrigger || open ? className : ""
      ].filter(Boolean).join(" ")}
      data-intensity={intensity}
    >
      {!hideTrigger && !open && (
        <button
          type="button"
          className={styles.trigger}
          aria-label="Открыть поиск по каталогу"
          onClick={openSearch}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M11 5a6 6 0 1 0 3.87 10.58L19 19.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            key="top-nav-search"
            className={[styles.frame, intensity === "vivid" ? styles.vivid : styles.balanced].join(" ")}
            initial={{ opacity: 0, x: 8, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6, scale: 0.99 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(false);
            }}
            aria-label="Поиск и фильтрация каталога"
          >
            <span className={styles.orbs} aria-hidden />

            <div className={styles.inner}>
              <span className={styles.searchIcon} aria-hidden>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5a6 6 0 1 0 3.87 10.58L19 19.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>

              <input
                ref={inputRef}
                className={styles.input}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Поиск по каталогу..."
                aria-label="Введите запрос для поиска по каталогу"
                type="search"
              />

              {value.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue("")}
                  className={styles.clearBtn}
                  aria-label="Очистить поиск"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}

              <button
                type="button"
                className={styles.filterBtn}
                aria-label="Открыть фильтры каталога"
                onClick={() => submitSearch(true)}
              >
                <svg preserveAspectRatio="none" height={16} width={16} viewBox="4.8 4.56 14.832 15.408" fill="none" aria-hidden="true">
                  <path
                    d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
