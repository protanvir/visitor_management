"use client";

import { useEffect, useState } from "react";

interface SiteStats { id: string; name: string; address: string; totalVisits: number; currentVisitors: number; todayVisits: number; pendingApprovals: number; }
interface OrganizationStats { totalSites: number; totalVisits: number; totalCurrentVisitors: number; totalTodayVisits: number; sites: SiteStats[]; }

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
        fetch("/api/sites", { headers }),
        fetch("/api/reports/dashboard", { headers }),
        fetch("/api/visits?pageSize=100", { headers }),
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
      const response = await fetch("/api/reports/export/csv", { headers: { Authorization: `Bearer ${token}` } });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `visits-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert("Failed to export"); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="loading w-8 h-8 text-brand"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Organization Overview</h1>
          <p className="text-muted">Multi-site analytics and reporting</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card p-6"><p className="text-sm text-muted mb-1">Total Sites</p><p className="text-3xl font-bold text-brand">{stats.totalSites}</p></div>
            <div className="card p-6"><p className="text-sm text-muted mb-1">Total Visits</p><p className="text-3xl font-bold text-brand">{stats.totalVisits}</p></div>
            <div className="card p-6"><p className="text-sm text-muted mb-1">Current Visitors</p><p className="text-3xl font-bold text-success">{stats.totalCurrentVisitors}</p></div>
            <div className="card p-6"><p className="text-sm text-muted mb-1">Today's Visits</p><p className="text-3xl font-bold text-accent">{stats.totalTodayVisits}</p></div>
          </div>

          <div className="card">
            <div className="card-body border-b border-neutral-100"><h3 className="font-bold text-heading">Site Comparison</h3></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Site</th><th>Address</th><th className="text-center">Total</th><th className="text-center">Current</th><th className="text-center">Today</th><th className="text-center">Pending</th></tr></thead>
                <tbody>
                  {stats.sites.map((site) => (
                    <tr key={site.id}>
                      <td className="font-medium text-heading">{site.name}</td>
                      <td className="text-muted text-sm">{site.address}</td>
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
        </>
      )}
    </div>
  );
}
