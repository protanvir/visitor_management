"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface BadgeData {
  id: string;
  qrCode: string;
  expiresAt: string;
  returnedAt: string | null;
  visit: {
    id: string;
    visitor: { name: string; company: string | null; email: string | null };
    host: { name: string; email: string };
    site: { name: string };
    purpose: string | null;
    status: string;
    expectedArrival: string | null;
    checkInTime: string | null;
  };
}

function BadgeViewerContent() {
  const searchParams = useSearchParams();
  const visitIdParam = searchParams.get("visitId");

  const [lookupValue, setLookupValue] = useState("");
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (visitIdParam) {
      setLookupValue(visitIdParam);
      lookupBadge(visitIdParam);
    }
  }, [visitIdParam]);

  useEffect(() => {
    if (!badge) return;
    const updateTimer = () => {
      const expires = new Date(badge.expiresAt).getTime();
      const now = Date.now();
      const diff = expires - now;
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [badge]);

  const lookupBadge = async (value?: string) => {
    const id = value || lookupValue;
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setBadge(null);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Try visit ID lookup first
      let response = await fetch(`/api/visits/${id}`, { headers });
      let result = await response.json();

      if (result.success && result.data.badge) {
        setBadge({
          ...result.data.badge,
          visit: {
            id: result.data.id,
            visitor: result.data.visitor,
            host: result.data.host,
            site: result.data.site,
            purpose: result.data.purpose,
            status: result.data.status,
            expectedArrival: result.data.expectedArrival,
            checkInTime: result.data.checkInTime,
          },
        });
      } else {
        // Try badge lookup
        response = await fetch(`/api/badges/lookup?qrCode=${id}`, { headers });
        result = await response.json();
        if (result.success) {
          setBadge({
            ...result.data,
            visit: result.data.visit,
          });
        } else {
          setError(result.error || "Badge not found");
        }
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = badge ? new Date(badge.expiresAt) < new Date() : false;
  const isCheckedIn = badge?.visit?.checkInTime != null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading">Badge Viewer</h2>
        <p className="text-muted">Look up a visitor badge by visit ID or badge ID</p>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={lookupValue}
            onChange={(e) => setLookupValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupBadge()}
            className="input flex-1"
            placeholder="Enter visit ID or badge ID"
          />
          <button onClick={() => lookupBadge()} disabled={!lookupValue.trim() || loading} className="btn btn-primary disabled:opacity-50">
            {loading ? "Looking up..." : "Look Up"}
          </button>
        </div>
        {error && <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">{error}</div>}
      </div>

      {badge && (
        <div className="card overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 ${isExpired ? "bg-danger" : "bg-primary-900"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-primary-900 font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Aptech Group</h3>
                  <p className="text-xs text-primary-200">Visitor Badge</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${isExpired ? "text-danger-200" : "text-primary-200"}`}>
                  {isExpired ? "EXPIRED" : isCheckedIn ? "CHECKED IN" : "VALID"}
                </p>
                {!isExpired && <p className="text-xs text-primary-300">{timeLeft}</p>}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 bg-white">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-lg border-2 border-neutral-200">
                <img src={badge.qrCode} alt="Badge QR Code" className="w-48 h-48" />
              </div>
            </div>
            <p className="text-center text-xs text-muted">
              {isCheckedIn ? "Present this QR code at entry points" : "Scan this QR code when you arrive to check in"}
            </p>
          </div>

          {/* Details */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Visitor</p>
                <p className="text-sm font-semibold text-heading">{badge.visit.visitor.name}</p>
                {badge.visit.visitor.company && <p className="text-xs text-muted">{badge.visit.visitor.company}</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Host</p>
                <p className="text-sm font-semibold text-heading">{badge.visit.host.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Location</p>
                <p className="text-sm font-semibold text-heading">{badge.visit.site.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Expires</p>
                <p className="text-sm font-semibold text-heading">{new Date(badge.expiresAt).toLocaleString()}</p>
              </div>
            </div>

            {badge.visit.purpose && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Purpose</p>
                <p className="text-sm text-heading">{badge.visit.purpose}</p>
              </div>
            )}

            {badge.visit.expectedArrival && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Expected Arrival</p>
                <p className="text-sm text-heading">{new Date(badge.visit.expectedArrival).toLocaleString()}</p>
              </div>
            )}

            {badge.visit.checkInTime && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Checked In At</p>
                <p className="text-sm text-heading">{new Date(badge.visit.checkInTime).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-primary-900 text-center">
            <p className="text-xs text-primary-200">
              This badge is the property of Aptech Group. Please return upon checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BadgeViewerPage() {
  return (
    <Suspense fallback={<div className="p-6 flex justify-center"><div className="loading w-8 h-8 text-brand"></div></div>}>
      <BadgeViewerContent />
    </Suspense>
  );
}
