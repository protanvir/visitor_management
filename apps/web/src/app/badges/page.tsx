"use client";

import { useEffect, useState } from "react";

interface Badge {
  id: string;
  visitId: string;
  qrCode: string;
  expiresAt: string;
  returnedAt: string | null;
  returnedBy: string | null;
  createdAt: string;
  visit: {
    visitor: {
      name: string;
      company: string | null;
    };
    host: {
      name: string;
    };
    site: {
      name: string;
    };
    status: string;
  };
}

interface BadgeStats {
  total: number;
  returned: number;
  active: number;
  overdue: number;
}

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "returned" | "overdue">("all");
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [filter]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);

      const response = await fetch(`http://localhost:3001/api/badges?${params}`);
      const result = await response.json();

      if (result.success) {
        setBadges(result.data.badges);
        setStats(result.data.stats);
      } else {
        setError(result.error || "Failed to fetch badges");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBadge = async (visitId: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/badges/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId }),
      });

      const result = await response.json();

      if (result.success) {
        setReturnModalOpen(false);
        setSelectedBadge(null);
        fetchBadges();
      } else {
        alert(result.error || "Failed to return badge");
      }
    } catch (err) {
      alert("Failed to return badge");
    }
  };

  const getStatusBadge = (badge: Badge) => {
    if (badge.returnedAt) return { text: "Returned", class: "badge-neutral" };
    if (new Date(badge.expiresAt) < new Date()) return { text: "Overdue", class: "badge-danger" };
    return { text: "Active", class: "badge-success" };
  };

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
                <h1 className="text-lg font-bold text-primary-900">Badge Management</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
              <a href="/badge" className="btn-accent text-sm">View Badge</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="page-title">Badge Tracking</h2>
          <p className="page-subtitle">Track and manage visitor badges across Aptech Group</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card text-center">
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total Badges</p>
            </div>
            <div className="stat-card text-center">
              <p className="stat-value text-success-600">{stats.active}</p>
              <p className="stat-label">Active</p>
            </div>
            <div className="stat-card text-center">
              <p className="stat-value text-neutral-600">{stats.returned}</p>
              <p className="stat-label">Returned</p>
            </div>
            <div className="stat-card text-center">
              <p className="stat-value text-danger-600">{stats.overdue}</p>
              <p className="stat-label">Overdue</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "returned", "overdue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-corporate font-medium text-sm transition-all ${
                filter === f
                  ? "bg-primary-900 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
            {error}
          </div>
        )}

        {/* Badges Table */}
        <div className="card-corporate">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading badges...</p>
            </div>
          ) : badges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table-corporate">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Host</th>
                    <th>Site</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map((badge) => {
                    const status = getStatusBadge(badge);
                    return (
                      <tr key={badge.id}>
                        <td>
                          <div>
                            <p className="font-medium text-primary-900">{badge.visit.visitor.name}</p>
                            {badge.visit.visitor.company && (
                              <p className="text-xs text-neutral-500">{badge.visit.visitor.company}</p>
                            )}
                          </div>
                        </td>
                        <td className="text-neutral-600">{badge.visit.host.name}</td>
                        <td className="text-neutral-600">{badge.visit.site.name}</td>
                        <td>
                          <p className="text-sm">{new Date(badge.expiresAt).toLocaleString()}</p>
                        </td>
                        <td>
                          <span className={`badge ${status.class}`}>{status.text}</span>
                        </td>
                        <td className="text-right">
                          {!badge.returnedAt && (
                            <button
                              onClick={() => {
                                setSelectedBadge(badge);
                                setReturnModalOpen(true);
                              }}
                              className="text-accent-600 hover:text-accent-700 font-medium text-sm"
                            >
                              Return
                            </button>
                          )}
                          {badge.returnedAt && (
                            <span className="text-sm text-neutral-400">
                              Returned {new Date(badge.returnedAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-neutral-500">No badges found</p>
            </div>
          )}
        </div>
      </main>

      {/* Return Modal */}
      {returnModalOpen && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-corporate-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-primary-900 mb-4">Return Badge</h3>
            <p className="text-neutral-600 mb-4">
              Are you sure you want to mark the badge for <strong>{selectedBadge.visit.visitor.name}</strong> as returned?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setReturnModalOpen(false);
                  setSelectedBadge(null);
                }}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReturnBadge(selectedBadge.visitId)}
                className="btn-success flex-1"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
