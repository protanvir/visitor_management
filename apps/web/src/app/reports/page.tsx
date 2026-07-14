"use client";

import { useEffect, useState } from "react";

interface SiteStats {
  id: string;
  name: string;
  address: string;
  totalVisits: number;
  currentVisitors: number;
  todayVisits: number;
  pendingApprovals: number;
}

interface OrganizationStats {
  totalSites: number;
  totalVisits: number;
  totalCurrentVisitors: number;
  totalTodayVisits: number;
  sites: SiteStats[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSite, setSelectedSite] = useState<string>("all");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch sites
      const sitesResponse = await fetch("http://localhost:3001/api/sites");
      const sitesResult = await sitesResponse.json();

      // Fetch dashboard data
      const dashboardResponse = await fetch("http://localhost:3001/api/reports/dashboard");
      const dashboardResult = await dashboardResponse.json();

      // Fetch visits for stats
      const visitsResponse = await fetch("http://localhost:3001/api/visits?pageSize=100");
      const visitsResult = await visitsResponse.json();

      if (sitesResult.success && dashboardResult.success && visitsResult.success) {
        const sites = sitesResult.data;
        const allVisits = visitsResult.data.data;

        // Calculate per-site stats
        const siteStats: SiteStats[] = sites.map((site: any) => {
          const siteVisits = allVisits.filter((v: any) => v.siteId === site.id);
          return {
            id: site.id,
            name: site.name,
            address: site.address || "",
            totalVisits: siteVisits.length,
            currentVisitors: siteVisits.filter((v: any) => v.status === "checked_in").length,
            todayVisits: siteVisits.filter((v: any) => {
              const today = new Date();
              const visitDate = new Date(v.createdAt);
              return visitDate.toDateString() === today.toDateString();
            }).length,
            pendingApprovals: siteVisits.filter((v: any) => v.status === "pending").length,
          };
        });

        setStats({
          totalSites: sites.length,
          totalVisits: allVisits.length,
          totalCurrentVisitors: allVisits.filter((v: any) => v.status === "checked_in").length,
          totalTodayVisits: dashboardResult.data.todayVisits,
          sites: siteStats,
        });
      }
    } catch (err) {
      setError("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reports/export/csv${selectedSite !== "all" ? `?siteId=${selectedSite}` : ""}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visits-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export CSV");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading reports...</p>
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
                <h1 className="text-lg font-bold text-primary-900">Reports & Analytics</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
              <a href="/dashboard" className="btn-ghost text-sm">Dashboard</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="page-title">Organization Overview</h2>
            <p className="page-subtitle">Multi-site analytics and reporting</p>
          </div>
          <button onClick={exportCSV} className="btn-accent">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
            {error}
          </div>
        )}

        {/* Overall Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="stat-card">
                <p className="stat-label">Total Sites</p>
                <p className="stat-value">{stats.totalSites}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total Visits</p>
                <p className="stat-value">{stats.totalVisits}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Current Visitors</p>
                <p className="stat-value text-success-600">{stats.totalCurrentVisitors}</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Today's Visits</p>
                <p className="stat-value text-accent-600">{stats.totalTodayVisits}</p>
              </div>
            </div>

            {/* Site Comparison */}
            <div className="card-corporate mb-8">
              <div className="card-corporate-header">
                <h3 className="text-lg font-semibold text-primary-900">Site Comparison</h3>
              </div>
              <div className="card-corporate-body">
                <div className="overflow-x-auto">
                  <table className="table-corporate">
                    <thead>
                      <tr>
                        <th>Site</th>
                        <th>Address</th>
                        <th className="text-center">Total Visits</th>
                        <th className="text-center">Current</th>
                        <th className="text-center">Today</th>
                        <th className="text-center">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.sites.map((site) => (
                        <tr key={site.id}>
                          <td>
                            <span className="font-medium text-primary-900">{site.name}</span>
                          </td>
                          <td className="text-neutral-500 text-sm">{site.address}</td>
                          <td className="text-center">
                            <span className="badge badge-primary">{site.totalVisits}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-success">{site.currentVisitors}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-accent">{site.todayVisits}</span>
                          </td>
                          <td className="text-center">
                            <span className="badge badge-warning">{site.pendingApprovals}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a href="/visitors" className="card-corporate p-6 hover:shadow-corporate-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-corporate-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">All Visitors</h4>
                    <p className="text-sm text-neutral-500">View complete visitor directory</p>
                  </div>
                </div>
              </a>

              <a href="/areas" className="card-corporate p-6 hover:shadow-corporate-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning-100 rounded-corporate-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">Areas & Access</h4>
                    <p className="text-sm text-neutral-500">Manage access control</p>
                  </div>
                </div>
              </a>

              <a href="/kiosk" className="card-corporate p-6 hover:shadow-corporate-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-success-100 rounded-corporate-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-900">New Check-In</h4>
                    <p className="text-sm text-neutral-500">Register a new visitor</p>
                  </div>
                </div>
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
