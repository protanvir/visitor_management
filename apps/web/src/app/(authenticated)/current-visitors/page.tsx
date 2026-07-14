"use client";

import { useEffect, useState } from "react";

interface Visit {
  id: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  purpose: string | null;
  visitorType: string;
  visitor: { id: string; name: string; email: string | null; phone: string | null; company: string | null };
  host: { id: string; name: string; email: string };
  site: { id: string; name: string };
  badge: { id: string; qrCode: string; expiresAt: string; returnedAt: string | null } | null;
}

export default function CurrentVisitorsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCurrentVisitors(); }, []);

  const fetchCurrentVisitors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/visits?status=checked_in&pageSize=100", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setVisits(result.data.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
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
      if (result.success) {
        fetchCurrentVisitors();
      } else {
        alert(result.error || "Failed to check out");
      }
    } catch (err) {
      alert("Failed to check out");
    } finally {
      setChecking(null);
    }
  };

  const getDuration = (checkInTime: string | null) => {
    if (!checkInTime) return "—";
    const mins = Math.floor((Date.now() - new Date(checkInTime).getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const filteredVisits = visits.filter((v) =>
    v.visitor.name.toLowerCase().includes(search.toLowerCase()) ||
    v.host.name.toLowerCase().includes(search.toLowerCase()) ||
    v.site.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Current Visitors</h1>
          <p className="text-muted">All visitors currently on premises ({visits.length})</p>
        </div>
        <button onClick={fetchCurrentVisitors} className="btn btn-ghost btn-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <input type="text" placeholder="Search by visitor, host, or site..." value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-md mb-6" />

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : filteredVisits.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Host</th>
                <th>Site</th>
                <th>Check-In Time</th>
                <th>Duration</th>
                <th>Purpose</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.map((visit) => (
                <tr key={visit.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar w-10 h-10 text-sm bg-success text-white">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-heading">{visit.visitor.name}</p>
                        <p className="text-xs text-muted">{visit.visitor.email || visit.visitor.phone || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{visit.host.name}</td>
                  <td className="text-muted">{visit.site.name}</td>
                  <td className="text-muted text-sm">{visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : "—"}</td>
                  <td><span className="badge badge-success">{getDuration(visit.checkInTime)}</span></td>
                  <td className="text-muted text-sm">{visit.purpose || "—"}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleCheckout(visit.id)}
                      disabled={checking === visit.id}
                      className="btn btn-danger btn-sm"
                    >
                      {checking === visit.id ? <span className="loading"></span> : "Check Out"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted">
            <div className="text-6xl mb-4">:)</div>
            <p className="font-medium">No visitors currently on premises</p>
          </div>
        )}
      </div>
    </div>
  );
}
