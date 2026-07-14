"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Visitor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  photoUrl: string | null;
  createdAt: string;
  visits: Visit[];
}

interface Visit {
  id: string;
  purpose: string | null;
  visitorType: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  ndaSigned: boolean;
  safetyBriefing: boolean;
  host: {
    name: string;
    email: string;
  };
  site: {
    name: string;
  };
  createdAt: string;
}

export default function VisitorDetailPage() {
  const params = useParams();
  const visitorId = params.id as string;
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visitorId) {
      fetchVisitor();
    }
  }, [visitorId]);

  const fetchVisitor = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/visitors/${visitorId}`);
      const result = await response.json();

      if (result.success) {
        setVisitor(result.data);
      } else {
        setError(result.error || "Failed to fetch visitor");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-danger-600 mb-4">{error || "Visitor not found"}</p>
          <a href="/visitors" className="btn-accent">Back to Visitors</a>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in": return "badge-success";
      case "checked_out": return "badge-neutral";
      case "pending": return "badge-warning";
      case "approved": return "badge-primary";
      default: return "badge-neutral";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-900 rounded-corporate flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-primary-900">Aptech Group</span>
            </div>
            <a href="/visitors" className="btn-ghost text-sm">Back to Visitors</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Visitor Info Card */}
        <div className="card-corporate mb-6">
          <div className="card-corporate-body">
            <div className="flex items-start gap-6">
              <div className="avatar avatar-xl bg-primary-100 text-primary-700">
                {visitor.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary-900">{visitor.name}</h1>
                <p className="text-neutral-500">{visitor.company || "No company"}</p>
                <div className="flex gap-4 mt-2 text-sm text-neutral-500">
                  {visitor.email && <span>{visitor.email}</span>}
                  {visitor.phone && <span>{visitor.phone}</span>}
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  Member since {new Date(visitor.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="stat-card text-center">
            <p className="stat-value">{visitor.visits.length}</p>
            <p className="stat-label">Total Visits</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-value text-success-600">
              {visitor.visits.filter((v) => v.status === "checked_in").length}
            </p>
            <p className="stat-label">Currently On-Site</p>
          </div>
          <div className="stat-card text-center">
            <p className="stat-value text-neutral-600">
              {visitor.visits.filter((v) => v.status === "checked_out").length}
            </p>
            <p className="stat-label">Completed Visits</p>
          </div>
        </div>

        {/* Visit History */}
        <div className="card-corporate">
          <div className="card-corporate-header">
            <h2 className="text-lg font-semibold text-primary-900">Visit History</h2>
          </div>
          <div className="card-corporate-body">
            {visitor.visits.length > 0 ? (
              <div className="space-y-4">
                {visitor.visits.map((visit) => (
                  <div key={visit.id} className="p-4 bg-neutral-50 rounded-corporate">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-primary-900">{visit.site.name}</span>
                          <span className={`badge ${getStatusBadge(visit.status)}`}>
                            {visit.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          Host: {visit.host.name} | Type: {visit.visitorType}
                        </p>
                        {visit.purpose && (
                          <p className="text-sm text-neutral-600 mt-1">Purpose: {visit.purpose}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-neutral-500">
                        <p>{new Date(visit.createdAt).toLocaleDateString()}</p>
                        {visit.checkInTime && (
                          <p>In: {new Date(visit.checkInTime).toLocaleTimeString()}</p>
                        )}
                        {visit.checkOutTime && (
                          <p>Out: {new Date(visit.checkOutTime).toLocaleTimeString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-neutral-400">
                      <span>NDA: {visit.ndaSigned ? "✓" : "✗"}</span>
                      <span>Safety: {visit.safetyBriefing ? "✓" : "✗"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-8">No visit history</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
