"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Visitor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  createdAt: string;
  _count: { visits: number };
  visits: Array<{
    id: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    purpose: string | null;
    host: { name: string };
    site: { name: string };
  }>;
}

interface PaginatedResponse { data: Visitor[]; total: number; page: number; pageSize: number; totalPages: number; }

export default function VisitorsPage() {
  const { isAdmin } = useAuth();
  const [visitors, setVisitors] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => { fetchVisitors(); }, [page, search]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: page.toString(), pageSize: "10", include: "visits" });
      if (search) params.append("search", search);
      const res = await fetch(`http://localhost:3001/api/visitors?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setVisitors(result.data); else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this visitor?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/visitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) fetchVisitors(); else alert(result.error);
    } catch (err) { alert("Failed to delete"); }
  };

  const handleCheckout = async (visitId: string) => {
    setChecking(visitId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/visits/${visitId}/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) fetchVisitors(); else alert(result.error);
    } catch (err) { alert("Failed to check out"); }
    finally { setChecking(null); }
  };

  const getActiveVisit = (visits: Visitor["visits"]) => {
    return visits?.find((v) => v.status === "checked_in");
  };

  const getDuration = (checkInTime: string | null) => {
    if (!checkInTime) return "—";
    const mins = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Visitor Directory</h1>
          <p className="text-muted">Manage and track all visitors</p>
        </div>
      </div>

      <input type="text" placeholder="Search visitors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-md mb-6" />

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : visitors && visitors.data.length > 0 ? (
          <table className="table">
            <thead><tr><th>Visitor</th><th>Email</th><th>Company</th><th>Status</th><th>Current Visit</th><th>Duration</th><th>Actions</th></tr></thead>
            <tbody>
              {visitors.data.map((visitor) => {
                const activeVisit = getActiveVisit(visitor.visits || []);
                return (
                  <tr key={visitor.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`avatar w-10 h-10 text-sm ${activeVisit ? "bg-success text-white" : ""}`}>{visitor.name.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-heading">{visitor.name}</p>
                          {visitor.phone && <p className="text-xs text-muted">{visitor.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-muted">{visitor.email || "—"}</td>
                    <td className="text-muted">{visitor.company || "—"}</td>
                    <td>
                      {activeVisit ? (
                        <span className="badge badge-success">On Premises</span>
                      ) : (
                        <span className="badge badge-primary">{visitor._count.visits} total visits</span>
                      )}
                    </td>
                    <td className="text-muted text-sm">
                      {activeVisit ? (
                        <div>
                          <p>{activeVisit.host.name}</p>
                          <p className="text-xs">{activeVisit.site.name}</p>
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      {activeVisit ? (
                        <span className="badge badge-success">{getDuration(activeVisit.checkInTime)}</span>
                      ) : "—"}
                    </td>
                    <td>
                      {activeVisit ? (
                        <button
                          onClick={() => handleCheckout(activeVisit.id)}
                          disabled={checking === activeVisit.id}
                          className="btn btn-danger btn-sm"
                        >
                          {checking === activeVisit.id ? <span className="loading"></span> : "Check Out"}
                        </button>
                      ) : (
                        <button onClick={() => handleDelete(visitor.id)} className="text-error hover:underline text-sm font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted">No visitors found</div>
        )}
      </div>

      {visitors && visitors.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted">Showing {((visitors.page - 1) * visitors.pageSize) + 1} to {Math.min(visitors.page * visitors.pageSize, visitors.total)} of {visitors.total}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-ghost btn-sm">Previous</button>
            <button onClick={() => setPage(page + 1)} disabled={page >= visitors.totalPages} className="btn btn-ghost btn-sm">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
