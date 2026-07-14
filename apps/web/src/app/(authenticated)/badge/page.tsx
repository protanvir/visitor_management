"use client";

import { useState } from "react";

export default function BadgeViewerPage() {
  const [badgeId, setBadgeId] = useState("");
  const [badge, setBadge] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lookupBadge = async () => {
    if (!badgeId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/badges/${badgeId}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.success) setBadge(result.data);
      else setError(result.error || "Badge not found");
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6"><h2 className="page-title">Badge Viewer</h2><p className="page-subtitle">Look up a visitor badge by ID</p></div>

      <div className="card-corporate p-6 mb-6">
        <div className="flex gap-4">
          <input type="text" value={badgeId} onChange={(e) => setBadgeId(e.target.value)} className="input-corporate flex-1" placeholder="Enter badge ID" />
          <button onClick={lookupBadge} disabled={!badgeId.trim() || loading} className="btn-accent disabled:opacity-50">{loading ? "Looking up..." : "Look Up"}</button>
        </div>
        {error && <div className="mt-4 p-3 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}
      </div>

      {badge && (
        <div className="card-corporate">
          <div className="card-corporate-header"><h3 className="font-semibold text-primary-900">Badge Details</h3></div>
          <div className="card-corporate-body space-y-3">
            <div className="flex justify-between"><span className="text-neutral-500">Visitor:</span><span className="font-medium text-primary-900">{badge.visit?.visitor?.name}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Host:</span><span className="font-medium text-primary-900">{badge.visit?.host?.name}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Site:</span><span className="font-medium text-primary-900">{badge.visit?.site?.name}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Expires:</span><span className="font-medium text-primary-900">{new Date(badge.expiresAt).toLocaleString()}</span></div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status:</span>
              <span className={`badge ${badge.returnedAt ? "badge-neutral" : new Date(badge.expiresAt) < new Date() ? "badge-danger" : "badge-success"}`}>
                {badge.returnedAt ? "Returned" : new Date(badge.expiresAt) < new Date() ? "Expired" : "Active"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
