"use client";

import { useEffect, useState } from "react";

interface AuditLog { id: string; action: string; entityType: string; entityId: string; userId?: string; user_name?: string; details?: any; createdAt: string; }
interface AuditStats { totalLogs: number; actionCounts: Record<string, number>; entityCounts: Record<string, number>; }

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
      const res = await fetch(`/api/audit?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) { setLogs(result.data.data); setTotalPages(result.data.totalPages); }
      else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/audit/stats/summary", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setStats(result.data);
    } catch (err) { console.error(err); }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/audit/export/csv", { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url);
    } catch (err) { alert("Failed to export"); }
  };

  const getActionColor = (action: string) => {
    if (action.includes("created") || action.includes("completed")) return "badge-success";
    if (action.includes("deleted") || action.includes("rejected")) return "badge-error";
    if (action.includes("updated")) return "badge-warning";
    return "badge-primary";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Audit Trail</h1>
          <p className="text-muted">Track all system activities</p>
        </div>
        <button onClick={exportCSV} className="btn btn-primary">Export CSV</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center"><p className="text-2xl font-bold text-brand">{stats.totalLogs}</p><p className="text-sm text-muted">Total Events</p></div>
          <div className="card p-4 text-center"><p className="text-2xl font-bold text-success">{Object.values(stats.actionCounts).reduce((s, v) => s + v, 0)}</p><p className="text-sm text-muted">Actions</p></div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="select w-auto">
          <option value="">All Actions</option><option value="visit.checked_in">Check-In</option><option value="visit.checked_out">Check-Out</option><option value="visit.approved">Approved</option><option value="visit.rejected">Rejected</option>
        </select>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }} className="select w-auto">
          <option value="">All Entities</option><option value="visitor">Visitors</option><option value="visit">Visits</option><option value="badge">Badges</option>
        </select>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : logs.length > 0 ? (
          <table className="table">
            <thead><tr><th>Timestamp</th><th>Action</th><th>Entity</th><th>User</th><th>Details</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-sm whitespace-nowrap text-muted">{new Date(log.createdAt).toLocaleString()}</td>
                  <td><span className={`badge ${getActionColor(log.action)}`}>{log.action.split(".").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span></td>
                  <td><p className="text-sm font-medium text-heading">{log.entityType}</p><p className="text-xs text-muted">{log.entityId.slice(0, 8)}...</p></td>
                  <td className="text-sm text-muted">{log.user_name || log.userId || "—"}</td>
                  <td className="text-sm text-muted max-w-xs truncate">{log.details ? JSON.stringify(log.details).slice(0, 50) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <div className="text-center py-12 text-muted">No audit logs found</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-ghost btn-sm">Previous</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="btn btn-ghost btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
