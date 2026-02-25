import * as React from "react";
import { Surface } from "./Surface";

export type LayoutShellProps = {
  children: React.ReactNode;
  topNav?: React.ReactNode;
  footer?: React.ReactNode;
};

export const LayoutShell: React.FC<LayoutShellProps> = ({ children, topNav, footer }) => {
  return (
    <div className="page-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-10 pt-6 sm:px-8 lg:px-10 lg:pt-8">
        {topNav && (
          <div className="mb-6">
            <Surface tone="subtle" className="flex items-center justify-between px-4 py-3 lg:px-5">
              {topNav}
            </Surface>
          </div>
        )}

        <main className="flex-1 py-4 lg:py-6">{children}</main>

        {footer && (
          <div className="mt-8 text-sm text-muted-foreground">
            <Surface tone="subtle" className="px-4 py-3 lg:px-5">
              {footer}
            </Surface>
          </div>
        )}
      </div>
    </div>
  );
};

