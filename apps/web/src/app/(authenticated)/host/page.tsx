"use client";

import { useEffect, useState } from "react";

interface Visit {
  id: string;
  visitor: { id: string; name: string; email: string | null; company: string | null };
  site: { name: string };
  purpose: string | null;
  visitorType: string;
  checkInTime: string | null;
  status: string;
}

export default function HostPage() {
  const [currentVisitors, setCurrentVisitors] = useState<Visit[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"current" | "pending">("current");
  const hostId = "demo-host-id";

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [currentRes, pendingRes] = await Promise.all([
        fetch(`http://localhost:3001/api/employees/${hostId}/current-visitors`, { headers }),
        fetch(`http://localhost:3001/api/employees/${hostId}/pending-approvals`, { headers }),
      ]);
      const currentResult = await currentRes.json();
      const pendingResult = await pendingRes.json();
      if (currentResult.success) setCurrentVisitors(currentResult.data);
      if (pendingResult.success) setPendingApprovals(pendingResult.data);
    } catch (err) { setError("Failed to fetch data"); }
    finally { setLoading(false); }
  };

  const handleApprove = async (visitId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/visits/${visitId}/approve`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await res.json();
    if (result.success) fetchData(); else alert(result.error);
  };

  const handleReject = async (visitId: string) => {
    const reason = prompt("Reason for rejection:");
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/visits/${visitId}/reject`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    });
    const result = await res.json();
    if (result.success) fetchData(); else alert(result.error);
  };

  const handleCheckout = async (visitId: string) => {
    if (!confirm("Check out this visitor?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:3001/api/visits/${visitId}/checkout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    const result = await res.json();
    if (result.success) fetchData(); else alert(result.error);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="loading w-8 h-8 text-brand"></div></div>;

  return (
    <div className="p-6">
      <div className="bg-brand-gradient rounded-xl p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-1">Host Dashboard</h2>
        <p className="opacity-90">Manage your visitors</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Current Visitors</p>
          <p className="text-3xl font-bold text-success">{currentVisitors.length}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-muted mb-1">Pending Approvals</p>
          <p className="text-3xl font-bold text-warning">{pendingApprovals.length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("current")} className={`btn ${activeTab === "current" ? "btn-primary" : "btn-ghost"}`}>
          Current Visitors ({currentVisitors.length})
        </button>
        <button onClick={() => setActiveTab("pending")} className={`btn ${activeTab === "pending" ? "btn-primary" : "btn-ghost"}`}>
          Pending Approvals ({pendingApprovals.length})
        </button>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {activeTab === "current" && (
        <div className="card">
          {currentVisitors.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {currentVisitors.map((visit) => (
                <div key={visit.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="avatar w-12 h-12 bg-success text-white">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <h3 className="font-semibold text-heading">{visit.visitor.name}</h3>
                        {visit.visitor.company && <p className="text-muted text-sm">{visit.visitor.company}</p>}
                        <p className="text-xs text-muted mt-1">Checked in: {visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : "-"}</p>
                        {visit.purpose && <p className="text-sm text-body mt-2"><span className="font-medium">Purpose:</span> {visit.purpose}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleCheckout(visit.id)} className="btn btn-danger btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Check Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-12 text-center text-muted">No current visitors</div>}
        </div>
      )}

      {activeTab === "pending" && (
        <div className="card">
          {pendingApprovals.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {pendingApprovals.map((visit) => (
                <div key={visit.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="avatar w-12 h-12 bg-warning text-white">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <h3 className="font-semibold text-heading">{visit.visitor.name}</h3>
                        {visit.visitor.company && <p className="text-muted text-sm">{visit.visitor.company}</p>}
                        <p className="text-xs text-muted mt-1">Type: <span className="badge badge-primary">{visit.visitorType}</span></p>
                        {visit.purpose && <p className="text-sm text-body mt-2"><span className="font-medium">Purpose:</span> {visit.purpose}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(visit.id)} className="btn btn-success btn-sm">Approve</button>
                      <button onClick={() => handleReject(visit.id)} className="btn btn-danger btn-sm">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="p-12 text-center text-muted">No pending approvals</div>}
        </div>
      )}
    </div>
  );
}
