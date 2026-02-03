"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { api, AgentStats } from "@/lib/api";
import {
  formatCurrency,
  formatNumber,
  formatLatency,
  formatPercentage,
} from "@/lib/utils";
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react";
import {
  useApiConfiguration,
  OnboardingScreen,
  LoadingSpinner,
} from "@/hooks/useApiConfiguration";

export default function AgentsPage() {
  const { isConfigured } = useApiConfiguration();
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentStats[]>([]);
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
        const data = await api.getAgentStats(timeRange, 50);
        setAgents(data);
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

  const totalCost = agents.reduce((sum, a) => sum + a.total_cost, 0);
  const totalCalls = agents.reduce((sum, a) => sum + a.total_calls, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Agents</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Cost and performance breakdown by agent
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
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
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Agents</p>
              <p className="text-2xl font-semibold text-white">
                {agents.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-900/30 text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Cost</p>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(totalCost)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-900/30 text-purple-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Calls</p>
              <p className="text-2xl font-semibold text-white">
                {formatNumber(totalCalls)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-900/30 text-amber-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-neutral-400">Avg Success Rate</p>
              <p className="text-2xl font-semibold text-white">
                {agents.length > 0
                  ? formatPercentage(
                      agents.reduce((sum, a) => sum + a.success_rate, 0) /
                        agents.length,
                    )
                  : "-"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Agents Table */}
      <Card padding="none">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h3 className="text-lg font-medium text-white">Agent Performance</h3>
        </div>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : agents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead className="text-right">Calls</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Avg Latency</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents
                .sort((a, b) => b.total_cost - a.total_cost)
                .map((agent) => (
                  <TableRow key={agent.agent_name}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-sm font-medium text-neutral-300">
                          {agent.agent_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">
                          {agent.agent_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(agent.total_calls)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(agent.total_tokens)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">
                      {formatCurrency(agent.total_cost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatLatency(agent.avg_latency_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          agent.success_rate >= 95
                            ? "success"
                            : agent.success_rate >= 80
                              ? "warning"
                              : "error"
                        }
                      >
                        {formatPercentage(agent.success_rate)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-64 items-center justify-center text-neutral-500">
            No agent data available
          </div>
        )}
      </Card>
    </div>
  );
}
