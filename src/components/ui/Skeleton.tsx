"use client";

import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-neutral-800", className)}
      style={style}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  // Generate deterministic heights based on index to avoid hydration mismatch
  const getHeight = (index: number) => {
    // Use a simple deterministic formula based on index
    return ((index * 17 + 31) % 60) + 25; // Range: 25-85%
  };

  return (
    <div className="flex h-64 items-end gap-2 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${getHeight(i)}%` }}
        />
      ))}
    </div>
  );
}
