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
}

interface PaginatedResponse {
  data: Visitor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function VisitorsPage() {
  const { isAdmin } = useAuth();
  const [visitors, setVisitors] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchVisitors();
  }, [page, search]);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: page.toString(), pageSize: "10" });
      if (search) params.append("search", search);

      const response = await fetch(`http://localhost:3001/api/visitors?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) setVisitors(result.data);
      else setError(result.error || "Failed to fetch visitors");
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this visitor?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/visitors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) fetchVisitors();
      else alert(result.error || "Failed to delete visitor");
    } catch (err) {
      alert("Failed to delete visitor");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="page-title">Visitor Directory</h2>
        <p className="page-subtitle">Manage and track all visitors across Aptech Group locations</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search visitors by name, email, or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-corporate pl-10"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button className="btn-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Visitor
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>
      )}

      <div className="card-corporate">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-500 font-medium">Loading visitors...</p>
          </div>
        ) : visitors && visitors.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="table-corporate">
                <thead>
                  <tr>
                    <th>Visitor</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Total Visits</th>
                    <th>Added</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.data.map((visitor) => (
                    <tr key={visitor.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-md bg-primary-100 text-primary-700">{visitor.name.charAt(0)}</div>
                          <div>
                            <p className="font-medium text-primary-900">{visitor.name}</p>
                            {visitor.phone && <p className="text-xs text-neutral-500">{visitor.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td>{visitor.email || "-"}</td>
                      <td>{visitor.company || "-"}</td>
                      <td><span className="badge badge-primary">{visitor._count.visits}</span></td>
                      <td>{new Date(visitor.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <button className="text-accent-600 hover:text-accent-700 font-medium text-sm mr-3">View</button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(visitor.id)} className="text-danger-600 hover:text-danger-700 font-medium text-sm">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-corporate-footer flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Showing <span className="font-medium text-primary-900">{(visitors.page - 1) * visitors.pageSize + 1}</span> to{" "}
                <span className="font-medium text-primary-900">{Math.min(visitors.page * visitors.pageSize, visitors.total)}</span> of{" "}
                <span className="font-medium text-primary-900">{visitors.total}</span> visitors
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button onClick={() => setPage(page + 1)} disabled={page >= visitors.totalPages} className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-neutral-500 font-medium">No visitors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
