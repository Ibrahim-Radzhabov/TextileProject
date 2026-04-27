"use client";

import { useEffect, useMemo, useState } from "react";

type BulkSelectionControlsProps = {
  formId: string;
  pageItemsCount: number;
};

function getCheckboxes(formId: string): HTMLInputElement[] {
  const selector = `input[type="checkbox"][name="product_ids"][form="${formId}"]`;
  return Array.from(document.querySelectorAll<HTMLInputElement>(selector));
}

export function BulkSelectionControls({ formId, pageItemsCount }: BulkSelectionControlsProps) {
  const [selectedCount, setSelectedCount] = useState(0);

  const allSelected = useMemo(
    () => pageItemsCount > 0 && selectedCount === pageItemsCount,
    [pageItemsCount, selectedCount]
  );

  useEffect(() => {
    const update = () => {
      const count = getCheckboxes(formId).filter((checkbox) => checkbox.checked).length;
      setSelectedCount(count);
    };

    const onChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }
      if (target.name !== "product_ids" || target.form?.id !== formId) {
        return;
      }
      update();
    };

    document.addEventListener("change", onChange);
    update();
    return () => {
      document.removeEventListener("change", onChange);
    };
  }, [formId]);

  const setAll = (checked: boolean) => {
    const checkboxes = getCheckboxes(formId);
    for (const checkbox of checkboxes) {
      checkbox.checked = checked;
    }
    setSelectedCount(checked ? checkboxes.length : 0);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setAll(true)}
        disabled={allSelected || pageItemsCount === 0}
        className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Выбрать все на странице
      </button>
      <button
        type="button"
        onClick={() => setAll(false)}
        disabled={selectedCount === 0}
        className="inline-flex h-8 items-center justify-center rounded-md border border-border/60 px-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Снять выбор
      </button>
      <span className="text-xs text-muted-foreground">Выбрано: {selectedCount}</span>
    </div>
  );
}
