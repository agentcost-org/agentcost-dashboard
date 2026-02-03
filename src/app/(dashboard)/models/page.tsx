"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TimeRangeSelector } from "@/components/layout/TimeRangeSelector";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, ModelStats } from "@/lib/api";
import { formatCurrency, formatNumber, formatLatency } from "@/lib/utils";
import { Cpu, DollarSign, Zap, ArrowUpDown, Database } from "lucide-react";
import {
  useApiConfiguration,
  OnboardingScreen,
  LoadingSpinner,
} from "@/hooks/useApiConfiguration";

export default function ModelsPage() {
  const { isConfigured } = useApiConfiguration();
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<ModelStats[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!api.isConfigured()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getModelStats(timeRange, 50);
        setModels(data);
        setShowOnboarding(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch data";
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("Invalid API key")
        ) {
          setShowOnboarding(true);
          setError(null);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  // Show onboarding if not configured or invalid API key
  if (isConfigured === false || showOnboarding) return <OnboardingScreen />;
  if (isConfigured === null) return <LoadingSpinner />;

  const totalCost = models.reduce((sum, m) => sum + m.total_cost, 0);
  const totalTokens = models.reduce((sum, m) => sum + m.total_tokens, 0);
  const totalCalls = models.reduce((sum, m) => sum + m.total_calls, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Models</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Usage and cost breakdown by LLM model
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/docs/models"
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 transition-colors"
          >
            <Database size={16} />
            Supported Models
          </Link>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-900/50 bg-red-950/20">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-900/30 text-primary-400">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Models Used</p>
              <p className="text-2xl font-semibold text-white">
                {models.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-900/30 text-emerald-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Spend</p>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-900/30 text-purple-400">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Tokens</p>
              <p className="text-2xl font-semibold text-white">
                {formatNumber(totalTokens)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-900/30 text-amber-400">
              <ArrowUpDown size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Avg Cost/Call</p>
              <p className="text-2xl font-semibold text-white">
                {totalCalls > 0 ? formatCurrency(totalCost / totalCalls) : "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Models Table */}
      <Card padding="none">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h3 className="text-lg font-medium text-white">Model Usage</h3>
        </div>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : models.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Input Tokens</TableHead>
                <TableHead className="text-right">Output Tokens</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Avg Latency</TableHead>
                <TableHead className="text-right">Cost Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models
                .sort((a, b) => b.total_cost - a.total_cost)
                .map((model) => (
                  <TableRow key={model.model}>
                    <TableCell>
                      <span className="font-mono font-medium text-white">
                        {model.model}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(model.total_calls)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-neutral-400">
                      {formatNumber(model.input_tokens)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-neutral-400">
                      {formatNumber(model.output_tokens)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">
                      {formatCurrency(model.total_cost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatLatency(model.avg_latency_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className="h-full bg-primary-500 transition-all"
                            style={{
                              width: `${totalCost > 0 ? (model.total_cost / totalCost) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-sm">
                          {totalCost > 0
                            ? ((model.total_cost / totalCost) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-64 items-center justify-center text-neutral-500">
            No model data available
          </div>
        )}
      </Card>
    </div>
  );
}
