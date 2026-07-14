"use client";

import { useState, useEffect } from "react";

interface BadgeRefreshProps {
  visitId: string;
  onRefresh: () => Promise<void>;
}

export default function BadgeRefresh({ visitId, onRefresh }: BadgeRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            handleRefresh();
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
      setCountdown(300);
    } catch (err) {
      console.error("Failed to refresh badge:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-corporate">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            autoRefresh ? "bg-success-500 animate-pulse" : "bg-neutral-400"
          }`}
        />
        <div>
          <p className="text-sm font-medium text-primary-900">
            {autoRefresh ? "Auto-refresh active" : "Auto-refresh paused"}
          </p>
          {lastRefresh && (
            <p className="text-xs text-neutral-500">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {autoRefresh && (
          <span className="text-sm text-neutral-500">
            {formatCountdown(countdown)}
          </span>
        )}

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-3 py-1 text-xs font-medium rounded-full ${
            autoRefresh
              ? "bg-success-100 text-success-700"
              : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {autoRefresh ? "Pause" : "Auto"}
        </button>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-neutral-500 hover:text-accent-600 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
