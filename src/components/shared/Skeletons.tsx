import { Skeleton } from "@/components/ui/skeleton";

/**
 * A small set of pre-composed skeletons used across list/dashboard pages.
 * Keeps loading UI consistent and avoids ad-hoc Skeleton soup in each page.
 */

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 space-y-2"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 space-y-2"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20 hidden md:block" />
          <Skeleton className="h-4 w-24 hidden md:block" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
