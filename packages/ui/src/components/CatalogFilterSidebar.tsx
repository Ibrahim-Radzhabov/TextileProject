import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Фильтры
        {value.tags.length > 0 && (
          <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
            {value.tags.length}
          </span>
        )}
      </p>
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
        >
          Сужать подборку
        </Button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-40 mt-2 w-56"
            >
              <Surface tone="subtle" className="space-y-3 px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
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
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const active = value.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px]",
                          active
                            ? "bg-accent text-white shadow-soft-subtle"
                            : "bg-card/60 text-muted-foreground border border-border/60 hover:border-accent-soft"
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

