import { Skeleton, Surface } from "@store-platform/ui";

export default function CatalogLoading() {
  return (
    <div className="min-h-0 space-y-7 pb-8">
      <header className="space-y-3">
        <Skeleton className="h-10 w-52" />
        <div className="premium-divider" />
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-pill" />
          <Skeleton className="h-6 w-24 rounded-pill" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-20">
          <Surface tone="ghost" className="rounded-2xl px-4 py-3">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-7 w-full rounded-pill" />
                ))}
              </div>
            </div>
          </Surface>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <Surface key={index} tone="subtle" className="overflow-hidden rounded-2xl">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 px-4 py-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </Surface>
          ))}
        </div>
      </div>
    </div>
  );
}
