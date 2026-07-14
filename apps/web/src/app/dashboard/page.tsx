"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  todayVisits: number;
  currentVisitors: number;
  pendingApprovals: number;
  recentVisits: any[];
  topHosts: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/reports/dashboard");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-danger-600 font-medium mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn-corporate">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-900 rounded-corporate flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-900">Dashboard</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
              <a href="/kiosk" className="btn-accent text-sm">New Check-In</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-corporate-xl p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-1">Welcome to Aptech Group Dashboard</h2>
          <p className="text-primary-200">Here's what's happening today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Current Visitors</p>
                <p className="stat-value">{data?.currentVisitors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-corporate-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Today's Visits</p>
                <p className="stat-value">{data?.todayVisits || 0}</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-corporate-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending Approvals</p>
                <p className="stat-value">{data?.pendingApprovals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-corporate-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Visits */}
          <div className="card-corporate">
            <div className="card-corporate-header">
              <h3 className="text-lg font-semibold text-primary-900">Recent Visits</h3>
            </div>
            <div className="card-corporate-body">
              {data?.recentVisits && data.recentVisits.length > 0 ? (
                <div className="space-y-3">
                  {data.recentVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-corporate">
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md bg-primary-100 text-primary-700">
                          {visit.visitor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-primary-900">{visit.visitor.name}</p>
                          <p className="text-xs text-neutral-500">Visiting {visit.host.name}</p>
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          visit.status === "checked_in"
                            ? "badge-success"
                            : visit.status === "pending"
                            ? "badge-warning"
                            : "badge-neutral"
                        }`}
                      >
                        {visit.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No recent visits</p>
              )}
            </div>
          </div>

          {/* Top Hosts */}
          <div className="card-corporate">
            <div className="card-corporate-header">
              <h3 className="text-lg font-semibold text-primary-900">Most Active Hosts Today</h3>
            </div>
            <div className="card-corporate-body">
              {data?.topHosts && data.topHosts.length > 0 ? (
                <div className="space-y-3">
                  {data.topHosts.map((host, index) => (
                    <div key={host.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-corporate">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-primary-200 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-primary-900">{host.name}</p>
                          <p className="text-xs text-neutral-500">{host.email}</p>
                        </div>
                      </div>
                      <span className="badge badge-primary">{host.visitCount} visitors</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">No host data today</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-corporate mt-8">
          <div className="card-corporate-header">
            <h3 className="text-lg font-semibold text-primary-900">Quick Actions</h3>
          </div>
          <div className="card-corporate-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/kiosk"
                className="flex flex-col items-center p-4 bg-accent-50 rounded-corporate-lg hover:bg-accent-100 transition-colors border border-accent-200"
              >
                <div className="w-12 h-12 bg-accent-100 rounded-corporate-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-accent-700">New Check-In</span>
              </a>
              <a
                href="/visitors"
                className="flex flex-col items-center p-4 bg-success-50 rounded-corporate-lg hover:bg-success-100 transition-colors border border-success-200"
              >
                <div className="w-12 h-12 bg-success-100 rounded-corporate-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-success-700">View Visitors</span>
              </a>
              <a
                href="/host"
                className="flex flex-col items-center p-4 bg-primary-50 rounded-corporate-lg hover:bg-primary-100 transition-colors border border-primary-200"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-corporate-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-primary-700">Host View</span>
              </a>
              <a
                href="/reports"
                className="flex flex-col items-center p-4 bg-warning-50 rounded-corporate-lg hover:bg-warning-100 transition-colors border border-warning-200"
              >
                <div className="w-12 h-12 bg-warning-100 rounded-corporate-lg flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-warning-700">Reports</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
