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
      const [currentResponse, pendingResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/employees/${hostId}/current-visitors`, { headers }),
        fetch(`http://localhost:3001/api/employees/${hostId}/pending-approvals`, { headers }),
      ]);
      const currentResult = await currentResponse.json();
      const pendingResult = await pendingResponse.json();
      if (currentResult.success) setCurrentVisitors(currentResult.data);
      if (pendingResult.success) setPendingApprovals(pendingResult.data);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId: string) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/api/visits/${visitId}/approve`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (result.success) fetchData();
    else alert(result.error || "Failed to approve");
  };

  const handleReject = async (visitId: string) => {
    const reason = prompt("Reason for rejection (optional):");
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/api/visits/${visitId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    if (result.success) fetchData();
    else alert(result.error || "Failed to reject");
  };

  const handleCheckout = async (visitId: string) => {
    if (!confirm("Are you sure you want to check out this visitor?")) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3001/api/visits/${visitId}/checkout`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (result.success) fetchData();
    else alert(result.error || "Failed to check out");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-corporate-xl p-6 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-1">Host Dashboard</h2>
        <p className="text-primary-200">Manage your visitors at Aptech Group</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Current Visitors</p>
              <p className="stat-value text-success-600">{currentVisitors.length}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-corporate-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Pending Approvals</p>
              <p className="stat-value text-warning-600">{pendingApprovals.length}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-corporate-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("current")} className={`px-4 py-2.5 rounded-corporate font-medium transition-all ${activeTab === "current" ? "bg-primary-900 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"}`}>
          Current Visitors ({currentVisitors.length})
        </button>
        <button onClick={() => setActiveTab("pending")} className={`px-4 py-2.5 rounded-corporate font-medium transition-all ${activeTab === "pending" ? "bg-warning-500 text-white" : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"}`}>
          Pending Approvals ({pendingApprovals.length})
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

      {activeTab === "current" && (
        <div className="card-corporate">
          {currentVisitors.length > 0 ? (
            <div className="divide-y divide-neutral-200">
              {currentVisitors.map((visit) => (
                <div key={visit.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="avatar avatar-lg bg-success-100 text-success-700">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-900">{visit.visitor.name}</h3>
                        {visit.visitor.company && <p className="text-neutral-500 text-sm">{visit.visitor.company}</p>}
                        <p className="text-xs text-neutral-400 mt-1">Checked in: {visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : "-"}</p>
                        {visit.purpose && <p className="text-sm text-neutral-600 mt-2"><span className="font-medium">Purpose:</span> {visit.purpose}</p>}
                      </div>
                    </div>
                    <button onClick={() => handleCheckout(visit.id)} className="btn-danger text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Check Out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-neutral-500 font-medium">No current visitors</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <div className="card-corporate">
          {pendingApprovals.length > 0 ? (
            <div className="divide-y divide-neutral-200">
              {pendingApprovals.map((visit) => (
                <div key={visit.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="avatar avatar-lg bg-warning-100 text-warning-700">{visit.visitor.name.charAt(0)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-primary-900">{visit.visitor.name}</h3>
                        {visit.visitor.company && <p className="text-neutral-500 text-sm">{visit.visitor.company}</p>}
                        <p className="text-xs text-neutral-400 mt-1">Type: <span className="badge badge-neutral">{visit.visitorType}</span></p>
                        {visit.purpose && <p className="text-sm text-neutral-600 mt-2"><span className="font-medium">Purpose:</span> {visit.purpose}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(visit.id)} className="btn-success text-sm">Approve</button>
                      <button onClick={() => handleReject(visit.id)} className="btn-danger text-sm">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-neutral-500 font-medium">No pending approvals</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
