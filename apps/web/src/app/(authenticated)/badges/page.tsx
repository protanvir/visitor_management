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
      const response = await fetch(`/api/badges?${params}`, { headers: { Authorization: `Bearer ${token}` } });
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
        <h1 className="text-2xl font-bold text-heading">Badge Tracking</h1>
        <p className="text-muted">Track and manage visitor badges</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-heading">{stats.total}</p>
            <p className="text-sm text-muted">Total Badges</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.active}</p>
            <p className="text-sm text-muted">Active</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-neutral-600">{stats.returned}</p>
            <p className="text-sm text-muted">Returned</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-danger">{stats.overdue}</p>
            <p className="text-sm text-muted">Overdue</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(["all", "active", "returned", "overdue"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : badges.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Host</th>
                <th>Site</th>
                <th>Expires</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {badges.map((badge) => {
                const status = getStatusBadge(badge);
                return (
                  <tr key={badge.id}>
                    <td>
                      <p className="font-medium text-heading">{badge.visit.visitor.name}</p>
                      {badge.visit.visitor.company && <p className="text-xs text-muted">{badge.visit.visitor.company}</p>}
                    </td>
                    <td className="text-muted">{badge.visit.host.name}</td>
                    <td className="text-muted">{badge.visit.site.name}</td>
                    <td className="text-sm">{new Date(badge.expiresAt).toLocaleString()}</td>
                    <td><span className={`badge ${status.class}`}>{status.text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted">No badges found</div>
        )}
      </div>
    </div>
  );
}
