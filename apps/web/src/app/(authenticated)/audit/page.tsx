"use client";

import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  user_name?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}

interface AuditStats {
  totalLogs: number;
  actionCounts: Record<string, number>;
  entityCounts: Record<string, number>;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => { fetchLogs(); fetchStats(); }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: page.toString(), pageSize: "20" });
      if (actionFilter) params.append("action", actionFilter);
      if (entityFilter) params.append("entityType", entityFilter);

      const response = await fetch(`http://localhost:3001/api/audit?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) { setLogs(result.data.data); setTotalPages(result.data.totalPages); }
      else setError(result.error || "Failed to fetch audit logs");
    } catch (err) {
      setError("Failed to connect to server");
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/audit/stats/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) setStats(result.data);
    } catch (err) { console.error("Failed to fetch stats:", err); }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/audit/export/csv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert("Failed to export CSV"); }
  };

  const getActionColor = (action: string) => {
    if (action.includes("created") || action.includes("completed")) return "badge-success";
    if (action.includes("deleted") || action.includes("rejected") || action.includes("denied")) return "badge-danger";
    if (action.includes("updated") || action.includes("returned")) return "badge-warning";
    return "badge-primary";
  };

  const formatAction = (action: string) => action.split(".").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="page-title">Audit Trail</h2>
          <p className="page-subtitle">Track all system activities and changes</p>
        </div>
        <button onClick={exportCSV} className="btn-accent">Export CSV</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card text-center"><p className="stat-value">{stats.totalLogs}</p><p className="stat-label">Total Events</p></div>
          <div className="stat-card text-center">
            <p className="stat-value text-success-600">{Object.entries(stats.actionCounts).filter(([k]) => k.includes("created") || k.includes("completed")).reduce((sum, [, v]) => sum + v, 0)}</p>
            <p className="stat-label">Created</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-value text-accent-600">{Object.entries(stats.actionCounts).filter(([k]) => k.includes("checked_in")).reduce((sum, [, v]) => sum + v, 0)}</p>
            <p className="stat-label">Check-Ins</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-value text-danger-600">{Object.entries(stats.actionCounts).filter(([k]) => k.includes("deleted") || k.includes("rejected")).reduce((sum, [, v]) => sum + v, 0)}</p>
            <p className="stat-label">Alerts</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="input-corporate w-auto">
          <option value="">All Actions</option>
          <option value="visit.checked_in">Check-In</option>
          <option value="visit.checked_out">Check-Out</option>
          <option value="visit.approved">Approved</option>
          <option value="visit.rejected">Rejected</option>
        </select>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="input-corporate w-auto">
          <option value="">All Entities</option>
          <option value="visitor">Visitors</option>
          <option value="visit">Visits</option>
          <option value="badge">Badges</option>
        </select>
      </div>

      {error && <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

      <div className="card-corporate">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading audit logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table-corporate">
                <thead><tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>User</th><th>Details</th></tr></thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-sm whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td><span className={`badge ${getActionColor(log.action)}`}>{formatAction(log.action)}</span></td>
                      <td><p className="text-sm font-medium text-primary-900">{log.entityType}</p><p className="text-xs text-neutral-500">{log.entityId.slice(0, 8)}...</p></td>
                      <td className="text-sm text-neutral-600">{log.user_name || log.userId || "-"}</td>
                      <td className="text-sm text-neutral-500 max-w-xs truncate">{log.details ? JSON.stringify(log.details).slice(0, 50) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-corporate-footer flex items-center justify-between">
              <p className="text-sm text-neutral-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="btn-ghost text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center"><p className="text-neutral-500 font-medium">No audit logs found</p></div>
        )}
      </div>
    </div>
  );
}
