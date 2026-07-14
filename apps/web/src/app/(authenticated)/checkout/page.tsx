"use client";

import { useState } from "react";

interface Visit {
  id: string;
  status: string;
  checkInTime: string | null;
  visitor: { id: string; name: string; email: string | null; phone: string | null; company: string | null };
  host: { id: string; name: string; email: string };
  site: { id: string; name: string };
  purpose: string | null;
  badge: { id: string; qrCode: string; expiresAt: string; returnedAt: string | null } | null;
}

export default function CheckoutPage() {
  const [visitId, setVisitId] = useState("");
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState(0);

  const lookupVisit = async () => {
    if (!visitId.trim()) return;
    setLoading(true);
    setError("");
    setVisit(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/visits/${visitId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setVisit(result.data);
        if (result.data.checkInTime) {
          const mins = Math.floor((Date.now() - new Date(result.data.checkInTime).getTime()) / 60000);
          setDuration(mins);
        }
      } else {
        setError(result.error || "Visit not found");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!visit) return;
    setChecking(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/visits/${visit.id}/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setSuccess(true);
        setVisit(null);
        setVisitId("");
      } else {
        setError(result.error || "Failed to check out");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setChecking(false);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Check-Out Visitor</h1>
        <p className="text-muted">Scan badge or enter visit ID to check out a visitor</p>
      </div>

      {/* Lookup Form */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-heading mb-4">Find Visit</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={visitId}
            onChange={(e) => setVisitId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupVisit()}
            className="input flex-1"
            placeholder="Enter Visit ID or Visitor ID"
          />
          <button onClick={lookupVisit} disabled={loading || !visitId.trim()} className="btn btn-primary">
            {loading ? <span className="loading"></span> : "Look Up"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {/* Success */}
      {success && (
        <div className="card p-8 text-center mb-6">
          <div className="text-6xl mb-4">:D</div>
          <h2 className="text-2xl font-bold text-success mb-2">Check-Out Complete!</h2>
          <p className="text-muted mb-6">Visitor has been successfully checked out.</p>
          <button onClick={() => setSuccess(false)} className="btn btn-primary">Check Out Another</button>
        </div>
      )}

      {/* Visit Details */}
      {visit && !success && (
        <div className="card">
          <div className="card-body border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-heading">Visit Details</h3>
              <span className={`badge ${visit.status === "checked_in" ? "badge-success" : "badge-warning"}`}>
                {visit.status.replace("_", " ")}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visitor Info */}
              <div>
                <h4 className="font-semibold text-heading mb-3">Visitor</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Name:</span><span className="font-medium">{visit.visitor.name}</span></div>
                  {visit.visitor.email && <div className="flex justify-between"><span className="text-muted">Email:</span><span>{visit.visitor.email}</span></div>}
                  {visit.visitor.phone && <div className="flex justify-between"><span className="text-muted">Phone:</span><span>{visit.visitor.phone}</span></div>}
                  {visit.visitor.company && <div className="flex justify-between"><span className="text-muted">Company:</span><span>{visit.visitor.company}</span></div>}
                </div>
              </div>

              {/* Visit Info */}
              <div>
                <h4 className="font-semibold text-heading mb-3">Visit</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted">Host:</span><span className="font-medium">{visit.host.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Site:</span><span>{visit.site.name}</span></div>
                  {visit.purpose && <div className="flex justify-between"><span className="text-muted">Purpose:</span><span>{visit.purpose}</span></div>}
                  <div className="flex justify-between"><span className="text-muted">Check-In:</span><span>{visit.checkInTime ? new Date(visit.checkInTime).toLocaleString() : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Duration:</span><span className="font-medium text-brand">{formatDuration(duration)}</span></div>
                </div>
              </div>
            </div>

            {/* Badge Info */}
            {visit.badge && (
              <div className="mt-6 p-4 bg-bg-page rounded-lg">
                <h4 className="font-semibold text-heading mb-2">Badge</h4>
                <div className="flex items-center gap-4 text-sm">
                  <div><span className="text-muted">Status:</span> <span className={`badge ${visit.badge.returnedAt ? "badge-success" : "badge-warning"}`}>{visit.badge.returnedAt ? "Returned" : "Active"}</span></div>
                  <div><span className="text-muted">Expires:</span> <span>{new Date(visit.badge.expiresAt).toLocaleString()}</span></div>
                </div>
              </div>
            )}

            {/* Check-Out Button */}
            {visit.status === "checked_in" && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleCheckout} disabled={checking} className="btn btn-danger btn-lg">
                  {checking ? <span className="loading"></span> : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Check Out Visitor
                    </>
                  )}
                </button>
              </div>
            )}

            {visit.status !== "checked_in" && (
              <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
                This visitor has already been checked out.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
