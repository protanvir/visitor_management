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

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reports/dashboard", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setData(result.data); else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="loading w-8 h-8 text-brand"></div></div>;
  if (error) return <div className="flex items-center justify-center py-20"><div className="text-center"><p className="text-error font-bold mb-4">{error}</p><button onClick={fetchDashboardData} className="btn btn-primary">Retry</button></div></div>;

  return (
    <div className="p-6">
      <div className="bg-brand-gradient text-white rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name || "User"}</h2>
        <p className="opacity-90">{user?.role === "admin" ? "Admin Dashboard" : "Here's what's happening today"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Current Visitors</p>
          <p className="text-3xl font-bold text-brand">{data?.currentVisitors || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Today's Visits</p>
          <p className="text-3xl font-bold text-accent">{data?.todayVisits || 0}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-warning">{data?.pendingApprovals || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body border-b border-neutral-100">
            <h3 className="font-bold text-heading">Recent Visits</h3>
          </div>
          <div className="card-body">
            {data?.recentVisits && data.recentVisits.length > 0 ? (
              <div className="space-y-3">
                {data.recentVisits.map((visit: any) => (
                  <div key={visit.id} className="flex items-center justify-between p-3 bg-page rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 text-sm">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-heading">{visit.visitor.name}</p>
                        <p className="text-xs text-muted">Visiting {visit.host.name}</p>
                      </div>
                    </div>
                    <span className={`badge ${visit.status === "checked_in" ? "badge-success" : visit.status === "pending" ? "badge-warning" : "badge-primary"}`}>
                      {visit.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-center py-8">No recent visits</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-body border-b border-neutral-100">
            <h3 className="font-bold text-heading">Most Active Hosts</h3>
          </div>
          <div className="card-body">
            {data?.topHosts && data.topHosts.length > 0 ? (
              <div className="space-y-3">
                {data.topHosts.map((host: any, index: number) => (
                  <div key={host.id} className="flex items-center justify-between p-3 bg-page rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                      <div>
                        <p className="font-medium text-heading">{host.name}</p>
                        <p className="text-xs text-muted">{host.email}</p>
                      </div>
                    </div>
                    <span className="badge badge-primary">{host.visitCount}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted text-center py-8">No host data today</p>}
          </div>
        </div>
      </div>

      <div className="card mt-8">
        <div className="card-body border-b border-neutral-100">
          <h3 className="font-bold text-heading">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/kiosk" className="flex flex-col items-center gap-2 p-4 bg-brand/5 border border-brand/20 rounded-lg hover:bg-brand/10 transition-colors">
              <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <span className="text-sm font-medium text-brand">Check In</span>
            </a>
            <a href="/visitors" className="flex flex-col items-center gap-2 p-4 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              <span className="text-sm font-medium text-accent">Visitors</span>
            </a>
            <a href="/host" className="flex flex-col items-center gap-2 p-4 bg-success/5 border border-success/20 rounded-lg hover:bg-success/10 transition-colors">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className="text-sm font-medium text-success">Host View</span>
            </a>
            <a href="/reports" className="flex flex-col items-center gap-2 p-4 bg-info/5 border border-info/20 rounded-lg hover:bg-info/10 transition-colors">
              <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-sm font-medium text-info">Reports</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
