import * as React from "react";

export type QuickActionFormItem = {
  label: string;
  value: string;
};

export type QuickActionFormHiddenField = {
  name: string;
  value: string;
};

export type QuickActionFormsProps = {
  formAction: string;
  actionFieldName?: string;
  actions: readonly QuickActionFormItem[];
  allowedValues: readonly string[];
  hiddenFields?: readonly QuickActionFormHiddenField[];
  emptyLabel?: string;
  containerClassName?: string;
  buttonClassName?: string;
  emptyClassName?: string;
};

const defaultContainerClassName = "flex flex-wrap gap-2";
const defaultButtonClassName =
  "inline-flex h-7 items-center justify-center rounded-md border border-border/60 px-2.5 text-[11px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground";
const defaultEmptyClassName = "text-xs text-muted-foreground/70";

export function QuickActionForms({
  formAction,
  actionFieldName = "status",
  actions,
  allowedValues,
  hiddenFields = [],
  emptyLabel = "—",
  containerClassName = defaultContainerClassName,
  buttonClassName = defaultButtonClassName,
  emptyClassName = defaultEmptyClassName
}: QuickActionFormsProps): JSX.Element {
  const visibleActions = actions.filter((action) => allowedValues.includes(action.value));

  if (visibleActions.length === 0) {
    return <span className={emptyClassName}>{emptyLabel}</span>;
  }

  return (
    <div className={containerClassName}>
      {visibleActions.map((action) => (
        <form key={`${actionFieldName}-${action.value}-${action.label}`} action={formAction} method="post">
          <input type="hidden" name={actionFieldName} value={action.value} />
          {hiddenFields.map((field) => (
            <input key={`${action.value}-${field.name}`} type="hidden" name={field.name} value={field.value} />
          ))}
          <button type="submit" className={buttonClassName}>
            {action.label}
          </button>
        </form>
      ))}
    </div>
  );
}
