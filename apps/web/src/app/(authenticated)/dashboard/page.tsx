"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface DashboardData {
  todayVisits: number;
  currentVisitors: number;
  pendingApprovals: number;
  recentVisits: any[];
  topHosts: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/reports/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-error font-bold mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <div className="bg-primary text-primary-content rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name || "User"}
        </h2>
        <p className="opacity-90">
          {user?.role === "admin" ? "Admin Dashboard" : "Here's what's happening today"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-title">Current Visitors</div>
          <div className="stat-value text-primary">{data?.currentVisitors || 0}</div>
        </div>

        <div className="stat bg-base-100 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-title">Today's Visits</div>
          <div className="stat-value text-secondary">{data?.todayVisits || 0}</div>
        </div>

        <div className="stat bg-base-100 border border-base-300 rounded-xl shadow-sm">
          <div className="stat-title">Pending Approvals</div>
          <div className="stat-value text-warning">{data?.pendingApprovals || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visits */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Recent Visits</h3>
            {data?.recentVisits && data.recentVisits.length > 0 ? (
              <div className="space-y-3 mt-4">
                {data.recentVisits.map((visit) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content w-10 h-10 rounded-full">
                          <span>{visit.visitor.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-bold">{visit.visitor.name}</p>
                        <p className="text-xs text-base-content/60">Visiting {visit.host.name}</p>
                      </div>
                    </div>
                    <span className={`badge ${
                      visit.status === "checked_in" ? "badge-success" :
                      visit.status === "pending" ? "badge-warning" : "badge-ghost"
                    }`}>
                      {visit.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No recent visits</p>
            )}
          </div>
        </div>

        {/* Top Hosts */}
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body">
            <h3 className="card-title">Most Active Hosts</h3>
            {data?.topHosts && data.topHosts.length > 0 ? (
              <div className="space-y-3 mt-4">
                {data.topHosts.map((host, index) => (
                  <div key={host.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-secondary text-secondary-content rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold">{host.name}</p>
                        <p className="text-xs text-base-content/60">{host.email}</p>
                      </div>
                    </div>
                    <span className="badge badge-secondary">{host.visitCount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No host data today</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 border border-base-300 mt-8">
        <div className="card-body">
          <h3 className="card-title">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <a href="/kiosk" className="btn btn-primary btn-outline flex-col h-24 gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Check In
            </a>
            <a href="/visitors" className="btn btn-secondary btn-outline flex-col h-24 gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Visitors
            </a>
            <a href="/host" className="btn btn-accent btn-outline flex-col h-24 gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Host View
            </a>
            <a href="/reports" className="btn btn-success btn-outline flex-col h-24 gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reports
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
