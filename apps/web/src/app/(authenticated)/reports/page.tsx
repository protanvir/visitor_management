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

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [sitesRes, dashRes, visitsRes] = await Promise.all([
        fetch("http://localhost:3001/api/sites", { headers }),
        fetch("http://localhost:3001/api/reports/dashboard", { headers }),
        fetch("http://localhost:3001/api/visits?pageSize=100", { headers }),
      ]);
      const sitesResult = await sitesRes.json();
      const dashResult = await dashRes.json();
      const visitsResult = await visitsRes.json();

      if (sitesResult.success && dashResult.success && visitsResult.success) {
        const sites = sitesResult.data;
        const allVisits = visitsResult.data.data;
        const siteStats: SiteStats[] = sites.map((site: any) => {
          const siteVisits = allVisits.filter((v: any) => v.siteId === site.id);
          return {
            id: site.id, name: site.name, address: site.address || "",
            totalVisits: siteVisits.length,
            currentVisitors: siteVisits.filter((v: any) => v.status === "checked_in").length,
            todayVisits: siteVisits.filter((v: any) => new Date(v.createdAt).toDateString() === new Date().toDateString()).length,
            pendingApprovals: siteVisits.filter((v: any) => v.status === "pending").length,
          };
        });
        setStats({
          totalSites: sites.length, totalVisits: allVisits.length,
          totalCurrentVisitors: allVisits.filter((v: any) => v.status === "checked_in").length,
          totalTodayVisits: dashResult.data.todayVisits, sites: siteStats,
        });
      }
    } catch (err) { setError("Failed to fetch statistics"); }
    finally { setLoading(false); }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/reports/export/csv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visits-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert("Failed to export CSV"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="page-title">Organization Overview</h2>
          <p className="page-subtitle">Multi-site analytics and reporting</p>
        </div>
        <button onClick={exportCSV} className="btn-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card"><p className="stat-label">Total Sites</p><p className="stat-value">{stats.totalSites}</p></div>
            <div className="stat-card"><p className="stat-label">Total Visits</p><p className="stat-value">{stats.totalVisits}</p></div>
            <div className="stat-card"><p className="stat-label">Current Visitors</p><p className="stat-value text-success-600">{stats.totalCurrentVisitors}</p></div>
            <div className="stat-card"><p className="stat-label">Today's Visits</p><p className="stat-value text-accent-600">{stats.totalTodayVisits}</p></div>
          </div>

          <div className="card-corporate mb-8">
            <div className="card-corporate-header"><h3 className="text-lg font-semibold text-primary-900">Site Comparison</h3></div>
            <div className="card-corporate-body">
              <div className="overflow-x-auto">
                <table className="table-corporate">
                  <thead><tr><th>Site</th><th>Address</th><th className="text-center">Total</th><th className="text-center">Current</th><th className="text-center">Today</th><th className="text-center">Pending</th></tr></thead>
                  <tbody>
                    {stats.sites.map((site) => (
                      <tr key={site.id}>
                        <td><span className="font-medium text-primary-900">{site.name}</span></td>
                        <td className="text-neutral-500 text-sm">{site.address}</td>
                        <td className="text-center"><span className="badge badge-primary">{site.totalVisits}</span></td>
                        <td className="text-center"><span className="badge badge-success">{site.currentVisitors}</span></td>
                        <td className="text-center"><span className="badge badge-primary">{site.todayVisits}</span></td>
                        <td className="text-center"><span className="badge badge-warning">{site.pendingApprovals}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
