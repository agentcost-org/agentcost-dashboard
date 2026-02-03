"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ModelChartProps {
  data: Array<{
    model: string;
    total_cost: number;
    total_calls: number;
  }>;
}

const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];

export function ModelChart({ data }: ModelChartProps) {
  const sortedData = [...data]
    .sort((a, b) => b.total_cost - a.total_cost)
    .slice(0, 6);

  const total = sortedData.reduce((sum, item) => sum + item.total_cost, 0);

  return (
    <div className="flex h-72 items-center">
      <div className="w-1/2">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="total_cost"
              nameKey="model"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {sortedData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
              formatter={(value) => [formatCurrency(value as number), "Cost"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 space-y-2">
        {sortedData.map((item, index) => (
          <div key={item.model} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-neutral-300 truncate max-w-30">
                {item.model}
              </span>
            </div>
            <span className="text-sm font-medium text-neutral-200">
              {total > 0 ? ((item.total_cost / total) * 100).toFixed(1) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
