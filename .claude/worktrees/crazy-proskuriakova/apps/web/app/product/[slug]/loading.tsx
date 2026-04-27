import { Skeleton, Surface } from "@store-platform/ui";

export default function ProductLoading() {
  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
        <Surface tone="subtle" className="overflow-hidden rounded-2xl">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="grid grid-cols-4 gap-2 p-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-xl" />
            ))}
          </div>
        </Surface>

        <div className="space-y-6 md:sticky md:top-20 md:self-start">
          <header className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </header>

          <Surface tone="subtle" className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-7 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-pill" />
                <Skeleton className="h-5 w-16 rounded-pill" />
              </div>
            </div>
            <Skeleton className="h-11 w-full rounded-lg" />
          </Surface>
        </div>
      </div>

      <section className="space-y-4">
        <Skeleton className="h-4 w-44" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Surface key={index} tone="subtle" className="min-w-[220px] max-w-[240px] flex-1 overflow-hidden rounded-2xl">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 px-4 py-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}
