"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
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
import { api, Event } from "@/lib/api";
import {
  formatCurrency,
  formatNumber,
  formatLatency,
  formatRelativeTime,
} from "@/lib/utils";
import { List, RefreshCw } from "lucide-react";
import {
  useApiConfiguration,
  OnboardingScreen,
  LoadingSpinner,
} from "@/hooks/useApiConfiguration";

export default function EventsPage() {
  const { isConfigured } = useApiConfiguration();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const pageSize = 50;

  async function fetchData() {
    if (!api.isConfigured()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [eventsData, countData] = await Promise.all([
        api.getEvents(pageSize, page * pageSize),
        api.getEventCount(),
      ]);

      setEvents(eventsData);
      setTotalCount(countData.count);
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

  useEffect(() => {
    fetchData();
  }, [page]);

  // Show onboarding if not configured or invalid API key
  if (isConfigured === false || showOnboarding) return <OnboardingScreen />;
  if (isConfigured === null) return <LoadingSpinner />;

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Events</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Raw event log of all LLM calls
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm font-medium text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-900/50 bg-red-950/20">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-900/30 text-primary-400">
            <List size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-400">Total Events</p>
            <p className="text-2xl font-semibold text-white">
              {formatNumber(totalCount)}
            </p>
          </div>
        </div>
      </Card>

      {/* Events Table */}
      <Card padding="none">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h3 className="text-lg font-medium text-white">Event Log</h3>
        </div>
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={10} />
          </div>
        ) : events.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">
                    <span title="Input tokens / Output tokens">
                      Tokens (In/Out)
                    </span>
                  </TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <span
                        className="text-neutral-400"
                        title={new Date(event.timestamp).toLocaleString()}
                      >
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">
                        {event.agent_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-neutral-300">
                        {event.model}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="font-mono text-sm"
                        title={`Input: ${event.input_tokens} tokens, Output: ${event.output_tokens} tokens`}
                      >
                        <span className="text-blue-400">
                          {formatNumber(event.input_tokens)}
                        </span>
                        <span className="text-neutral-600 mx-1">/</span>
                        <span className="text-green-400">
                          {formatNumber(event.output_tokens)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-400">
                      {formatCurrency(event.cost)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatLatency(event.latency_ms)}
                    </TableCell>
                    <TableCell>
                      {event.success ? (
                        <Badge variant="success">Success</Badge>
                      ) : (
                        <Badge variant="error">Failed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4">
                <p className="text-sm text-neutral-400">
                  Showing {page * pageSize + 1} to{" "}
                  {Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm font-medium text-neutral-200 hover:border-neutral-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-64 items-center justify-center text-neutral-500">
            No events recorded yet
          </div>
        )}
      </Card>
    </div>
  );
}
