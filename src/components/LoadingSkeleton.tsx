import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Table skeleton for data tables
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b border-border/50">
          <div className="flex gap-6">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 border-b border-border/30 last:border-0">
            <div className="flex gap-6">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className="h-4 flex-1" 
                  style={{ animationDelay: `${(rowIndex * columns + colIndex) * 50}ms` }}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Metric card skeleton
 */
export function MetricCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 bg-muted" />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-28 mb-3" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 justify-around" style={{ height: `${height}px` }}>
          {[65, 45, 80, 55, 70, 40, 85, 60].map((h, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 max-w-[40px] rounded-t-md" 
              style={{ 
                height: `${h}%`,
                animationDelay: `${i * 100}ms`
              }} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Full page loading skeleton with staggered animation
 */
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ animationDelay: `${i * 100}ms` }}>
            <MetricCardSkeleton />
          </div>
        ))}
      </div>

      {/* Main content */}
      <TableSkeleton rows={6} columns={5} />
    </div>
  );
}

/**
 * Dashboard skeleton with charts
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}