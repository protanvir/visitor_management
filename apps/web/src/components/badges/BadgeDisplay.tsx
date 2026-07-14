"use client";

import { useEffect, useState } from "react";

interface BadgeData {
  id: string;
  visitId: string;
  qrCode: string;
  expiresAt: string;
  visit: {
    visitor: {
      name: string;
      company: string | null;
    };
    host: {
      name: string;
    };
    site: {
      name: string;
    };
    purpose: string | null;
  };
}

interface BadgeDisplayProps {
  visitId: string;
  onExpire?: () => void;
}

export default function BadgeDisplay({ visitId, onExpire }: BadgeDisplayProps) {
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    fetchBadge();
  }, [visitId]);

  useEffect(() => {
    if (!badge) return;

    const updateTimer = () => {
      const expiresAt = new Date(badge.expiresAt);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expired");
        onExpire?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [badge, onExpire]);

  const fetchBadge = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/visits/${visitId}`);
      const result = await response.json();

      if (result.success && result.data.badge) {
        setBadge({
          ...result.data.badge,
          visit: {
            visitor: result.data.visitor,
            host: result.data.host,
            site: result.data.site,
            purpose: result.data.purpose,
          },
        });
      } else {
        setError("Badge not found");
      }
    } catch (err) {
      setError("Failed to fetch badge");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-corporate p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading badge...</p>
      </div>
    );
  }

  if (error || !badge) {
    return (
      <div className="card-corporate p-8 text-center">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-danger-600 font-medium">{error || "Badge not found"}</p>
      </div>
    );
  }

  const isExpired = new Date(badge.expiresAt) < new Date();

  return (
    <div className="card-corporate overflow-hidden">
      {/* Badge Header */}
      <div className={`px-6 py-4 ${isExpired ? "bg-danger-600" : "bg-primary-900"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-corporate flex items-center justify-center">
              <span className="text-primary-900 font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Aptech Group</h3>
              <p className="text-xs text-primary-200">Visitor Badge</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${isExpired ? "text-danger-200" : "text-primary-200"}`}>
              {isExpired ? "EXPIRED" : "VALID"}
            </p>
            {!isExpired && (
              <p className="text-xs text-primary-300">{timeLeft}</p>
            )}
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-6 bg-white">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white rounded-corporate-lg border-2 border-neutral-200">
            <img
              src={badge.qrCode}
              alt="Badge QR Code"
              className="w-48 h-48"
            />
          </div>
        </div>
        <p className="text-center text-xs text-neutral-500">
          Scan this QR code at entry points
        </p>
      </div>

      {/* Badge Details */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Visitor</p>
            <p className="text-sm font-semibold text-primary-900">{badge.visit.visitor.name}</p>
            {badge.visit.visitor.company && (
              <p className="text-xs text-neutral-500">{badge.visit.visitor.company}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Host</p>
            <p className="text-sm font-semibold text-primary-900">{badge.visit.host.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</p>
            <p className="text-sm font-semibold text-primary-900">{badge.visit.site.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Expires</p>
            <p className="text-sm font-semibold text-primary-900">
              {new Date(badge.expiresAt).toLocaleString()}
            </p>
          </div>
        </div>

        {badge.visit.purpose && (
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Purpose</p>
            <p className="text-sm text-primary-900">{badge.visit.purpose}</p>
          </div>
        )}
      </div>

      {/* Badge Footer */}
      <div className="px-6 py-3 bg-primary-900 text-center">
        <p className="text-xs text-primary-200">
          This badge is the property of Aptech Group. Please return upon checkout.
        </p>
      </div>
    </div>
  );
}
