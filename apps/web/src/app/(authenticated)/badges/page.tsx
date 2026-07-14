"use client";

import { useEffect, useState } from "react";

interface Badge {
  id: string;
  visitId: string;
  qrCode: string;
  expiresAt: string;
  returnedAt: string | null;
  visit: { visitor: { name: string; company: string | null }; host: { name: string }; site: { name: string }; status: string };
}

interface BadgeStats { total: number; returned: number; active: number; overdue: number; }

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "returned" | "overdue">("all");

  useEffect(() => { fetchBadges(); }, [filter]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      const response = await fetch(`http://localhost:3001/api/badges?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.success) { setBadges(result.data.badges); setStats(result.data.stats); }
      else setError(result.error || "Failed to fetch badges");
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const getStatusBadge = (badge: Badge) => {
    if (badge.returnedAt) return { text: "Returned", class: "badge-neutral" };
    if (new Date(badge.expiresAt) < new Date()) return { text: "Overdue", class: "badge-danger" };
    return { text: "Active", class: "badge-success" };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="page-title">Badge Tracking</h2>
        <p className="page-subtitle">Track and manage visitor badges</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card text-center"><p className="stat-value">{stats.total}</p><p className="stat-label">Total Badges</p></div>
          <div className="stat-card text-center"><p className="stat-value text-success-600">{stats.active}</p><p className="stat-label">Active</p></div>
          <div className="stat-card text-center"><p className="stat-value text-neutral-600">{stats.returned}</p><p className="stat-label">Returned</p></div>
          <div className="stat-card text-center"><p className="stat-value text-danger-600">{stats.overdue}</p><p className="stat-label">Overdue</p></div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(["all", "active", "returned", "overdue"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-corporate font-medium text-sm transition-all ${filter === f ? "bg-primary-900 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

      <div className="card-corporate">
        {loading ? (
          <div className="p-12 text-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div><p className="text-neutral-500">Loading badges...</p></div>
        ) : badges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-corporate">
              <thead><tr><th>Visitor</th><th>Host</th><th>Site</th><th>Expires</th><th>Status</th></tr></thead>
              <tbody>
                {badges.map((badge) => {
                  const status = getStatusBadge(badge);
                  return (
                    <tr key={badge.id}>
                      <td><p className="font-medium text-primary-900">{badge.visit.visitor.name}</p>{badge.visit.visitor.company && <p className="text-xs text-neutral-500">{badge.visit.visitor.company}</p>}</td>
                      <td className="text-neutral-600">{badge.visit.host.name}</td>
                      <td className="text-neutral-600">{badge.visit.site.name}</td>
                      <td className="text-sm">{new Date(badge.expiresAt).toLocaleString()}</td>
                      <td><span className={`badge ${status.class}`}>{status.text}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="p-12 text-center"><p className="text-neutral-500">No badges found</p></div>}
      </div>
    </div>
  );
}
