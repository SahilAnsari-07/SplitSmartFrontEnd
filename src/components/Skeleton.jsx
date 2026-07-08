import React from 'react';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
      {...props}
    />
  );
}

export function ExpenseSkeleton() {
  return (
    <div className="p-5 rounded-2xl border bg-card border-border mb-3">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-16 h-6 mt-1" />
      </div>
    </div>
  );
}

export function GroupSkeleton() {
  return (
    <div className="w-full bg-card rounded-2xl border border-border p-5 mb-3">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4 mt-2" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
