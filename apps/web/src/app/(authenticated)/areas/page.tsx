"use client";

import { useEffect, useState } from "react";

interface Area {
  id: string; name: string; siteId: string; description: string | null;
  accessLevel: "public" | "restricted" | "secure";
  requiresNDA: boolean; requiresSafetyBriefing: boolean; maxOccupancy: number | null;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchAreas(); }, []);

  const fetchAreas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/areas", { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.success) setAreas(result.data);
      else setError(result.error || "Failed to fetch areas");
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) { case "public": return "badge-success"; case "restricted": return "badge-warning"; case "secure": return "badge-danger"; default: return "badge-neutral"; }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div><p className="text-neutral-600 font-medium">Loading areas...</p></div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="page-title">Areas & Access Control</h2>
        <p className="page-subtitle">Manage access levels and requirements for different areas</p>
      </div>

      {error && <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

      <div className="card-corporate mb-6">
        <div className="card-corporate-body">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Access Levels</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2"><span className="badge badge-success">Public</span><span className="text-sm text-neutral-500">Open to all visitors</span></div>
            <div className="flex items-center gap-2"><span className="badge badge-warning">Restricted</span><span className="text-sm text-neutral-500">Requires host approval & NDA</span></div>
            <div className="flex items-center gap-2"><span className="badge badge-danger">Secure</span><span className="text-sm text-neutral-500">Requires NDA & safety briefing</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="card-corporate">
            <div className="card-corporate-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary-900">{area.name}</h3>
                  <span className={`badge ${getAccessLevelColor(area.accessLevel)}`}>{area.accessLevel}</span>
                </div>
              </div>
            </div>
            <div className="card-corporate-body">
              {area.description && <p className="text-sm text-neutral-600 mb-4">{area.description}</p>}
              <div className="space-y-2">
                {area.maxOccupancy && <div className="flex items-center justify-between text-sm"><span className="text-neutral-500">Max Occupancy:</span><span className="font-medium text-primary-900">{area.maxOccupancy}</span></div>}
                <div className="flex items-center justify-between text-sm"><span className="text-neutral-500">NDA Required:</span><span className={`font-medium ${area.requiresNDA ? "text-danger-600" : "text-success-600"}`}>{area.requiresNDA ? "Yes" : "No"}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-neutral-500">Safety Briefing:</span><span className={`font-medium ${area.requiresSafetyBriefing ? "text-danger-600" : "text-success-600"}`}>{area.requiresSafetyBriefing ? "Required" : "Not Required"}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {areas.length === 0 && !loading && <div className="card-corporate p-12 text-center"><p className="text-neutral-500 font-medium">No areas configured</p></div>}
    </div>
  );
}
