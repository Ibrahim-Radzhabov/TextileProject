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
  const selectedCount = value.tags.length;

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const toggleTag = (tag: string) => {
    const exists = value.tags.includes(tag);
    const next = exists
      ? value.tags.filter((t) => t !== tag)
      : [...value.tags, tag];
    onChange({ ...value, tags: next });
  };

  const clearTags = () => onChange({ ...value, tags: [] });

  const renderPanelContent = () => (
    <Surface tone="elevated" className="space-y-4 rounded-2xl px-4 py-4">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Фильтры каталога
        </p>
        <div className="premium-divider" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Теги
        </span>
        <div className="flex items-center gap-2">
          {selectedCount > 0 && <Badge tone="accent">{selectedCount}</Badge>}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Сбросить
            </button>
          )}
        </div>
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
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
          Фильтры каталога
        </p>
        <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
          {selectedCount > 0 ? `Фильтры (${selectedCount})` : "Открыть фильтры"}
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="hidden lg:block"
      >
        {renderPanelContent()}
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-xs border-r border-border/60 bg-background/95 px-3 py-4 shadow-floating backdrop-blur-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Фильтры</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                >
                  Закрыть
                </button>
              </div>
              {renderPanelContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
