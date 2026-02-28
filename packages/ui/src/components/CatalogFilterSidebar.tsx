"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "./Badge";
import { Surface } from "./Surface";
import { Button } from "./Button";

export type CatalogFilterState = {
  tags: string[];
};

export type CatalogFilterSidebarProps = {
  availableTags: string[];
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
};

export const CatalogFilterSidebar: React.FC<CatalogFilterSidebarProps> = ({
  availableTags,
  value,
  onChange
}) => {
  const [open, setOpen] = React.useState(false);

  const toggleTag = (tag: string) => {
    const exists = value.tags.includes(tag);
    const next = exists
      ? value.tags.filter((t) => t !== tag)
      : [...value.tags, tag];
    onChange({ ...value, tags: next });
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        Фильтры каталога
        {value.tags.length > 0 && (
          <span className="ml-2">
            <Badge tone="accent">
            {value.tags.length}
            </Badge>
          </span>
        )}
      </p>
      <div className="relative">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Скрыть фильтры" : "Открыть фильтры"}
        </Button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 z-40 mt-2 w-full min-w-0 sm:left-auto sm:right-0 sm:w-72"
            >
              <Surface tone="elevated" className="space-y-4 rounded-2xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Теги
                  </span>
                  {value.tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onChange({ ...value, tags: [] })}
                      className="text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const active = value.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          "rounded-pill border px-3 py-1 text-[11px] transition-all duration-[var(--motion-fast)]",
                          active
                            ? "border-accent/60 bg-accent-soft/35 text-accent-contrast shadow-glow"
                            : "border-border/55 bg-card/55 text-muted-foreground hover:border-accent/40 hover:text-foreground"
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {tag}
                      </button>
                    );
                  })}
                  {availableTags.length === 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      Теги появятся по мере заполнения каталога.
                    </span>
                  )}
                </div>
              </Surface>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
