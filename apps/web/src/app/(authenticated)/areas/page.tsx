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
      const res = await fetch("http://localhost:3001/api/areas", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setAreas(result.data); else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const getAccessColor = (level: string) => {
    switch (level) { case "public": return "badge-success"; case "restricted": return "badge-warning"; case "secure": return "badge-error"; default: return "badge-primary"; }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="loading w-8 h-8 text-brand"></div></div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Areas & Access Control</h1>
        <p className="text-muted">Manage access levels for different areas</p>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="card mb-6 p-4">
        <h3 className="text-sm font-semibold text-heading mb-3">Access Levels</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2"><span className="badge badge-success">Public</span><span className="text-sm text-muted">Open to all</span></div>
          <div className="flex items-center gap-2"><span className="badge badge-warning">Restricted</span><span className="text-sm text-muted">Requires approval & NDA</span></div>
          <div className="flex items-center gap-2"><span className="badge badge-error">Secure</span><span className="text-sm text-muted">Requires NDA & safety briefing</span></div>
        </div>
      </div>

      {areas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div key={area.id} className="card">
              <div className="card-body border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-heading">{area.name}</h3>
                  <span className={`badge ${getAccessColor(area.accessLevel)}`}>{area.accessLevel}</span>
                </div>
              </div>
              <div className="card-body">
                {area.description && <p className="text-sm text-muted mb-4">{area.description}</p>}
                <div className="space-y-2 text-sm">
                  {area.maxOccupancy && <div className="flex justify-between"><span className="text-muted">Max Occupancy:</span><span className="font-medium text-heading">{area.maxOccupancy}</span></div>}
                  <div className="flex justify-between"><span className="text-muted">NDA Required:</span><span className={`font-medium ${area.requiresNDA ? "text-error" : "text-success"}`}>{area.requiresNDA ? "Yes" : "No"}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Safety Briefing:</span><span className={`font-medium ${area.requiresSafetyBriefing ? "text-error" : "text-success"}`}>{area.requiresSafetyBriefing ? "Required" : "Not Required"}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-muted">No areas configured</div>
      )}
    </div>
  );
}
