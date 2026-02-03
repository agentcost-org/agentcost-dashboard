"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ranges = [
  { value: "1h", label: "Last hour" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedRange = ranges.find((r) => r.value === value) || ranges[2];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800"
      >
        <span>{selectedRange.label}</span>
        <ChevronDown
          size={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 animate-slide-down rounded-lg border border-neutral-700 bg-neutral-800 py-1 shadow-xl">
            {ranges.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  onChange(range.value);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-4 py-2 text-left text-sm transition-colors",
                  range.value === value
                    ? "bg-primary-600/10 text-primary-400"
                    : "text-neutral-300 hover:bg-neutral-700",
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
