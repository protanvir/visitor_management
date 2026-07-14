"use client";

import { useEffect, useState } from "react";

interface Area {
  id: string;
  name: string;
  siteId: string;
  description: string | null;
  accessLevel: "public" | "restricted" | "secure";
  requiresNDA: boolean;
  requiresSafetyBriefing: boolean;
  maxOccupancy: number | null;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/areas");
      const result = await response.json();

      if (result.success) {
        setAreas(result.data);
      } else {
        setError(result.error || "Failed to fetch areas");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public":
        return "badge-success";
      case "restricted":
        return "badge-warning";
      case "secure":
        return "badge-danger";
      default:
        return "badge-neutral";
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "public":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "restricted":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "secure":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading areas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-900 rounded-corporate flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-900">Areas & Access</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
              <a href="/dashboard" className="btn-ghost text-sm">Dashboard</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="page-title">Areas & Access Control</h2>
          <p className="page-subtitle">Manage access levels and requirements for different areas</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
            {error}
          </div>
        )}

        {/* Access Level Legend */}
        <div className="card-corporate mb-6">
          <div className="card-corporate-body">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Access Levels</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="badge badge-success">Public</span>
                <span className="text-sm text-neutral-500">Open to all visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-warning">Restricted</span>
                <span className="text-sm text-neutral-500">Requires host approval & NDA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-danger">Secure</span>
                <span className="text-sm text-neutral-500">Requires NDA & safety briefing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div key={area.id} className="card-corporate">
              <div className="card-corporate-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-corporate flex items-center justify-center ${
                      area.accessLevel === "public"
                        ? "bg-success-100 text-success-600"
                        : area.accessLevel === "restricted"
                        ? "bg-warning-100 text-warning-600"
                        : "bg-danger-100 text-danger-600"
                    }`}>
                      {getAccessLevelIcon(area.accessLevel)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900">{area.name}</h3>
                      <span className={`badge ${getAccessLevelColor(area.accessLevel)}`}>
                        {area.accessLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-corporate-body">
                {area.description && (
                  <p className="text-sm text-neutral-600 mb-4">{area.description}</p>
                )}

                <div className="space-y-2">
                  {area.maxOccupancy && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Max Occupancy:</span>
                      <span className="font-medium text-primary-900">{area.maxOccupancy}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">NDA Required:</span>
                    <span className={`font-medium ${area.requiresNDA ? "text-danger-600" : "text-success-600"}`}>
                      {area.requiresNDA ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Safety Briefing:</span>
                    <span className={`font-medium ${area.requiresSafetyBriefing ? "text-danger-600" : "text-success-600"}`}>
                      {area.requiresSafetyBriefing ? "Required" : "Not Required"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {areas.length === 0 && !loading && (
          <div className="card-corporate p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-neutral-500 font-medium">No areas configured</p>
            <p className="text-sm text-neutral-400 mt-1">Add areas to manage access control</p>
          </div>
        )}
      </main>
    </div>
  );
}
