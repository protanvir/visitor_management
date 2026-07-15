"use client";

import { useEffect, useState } from "react";

interface ChecklistItem { id: string; label: string; description: string; required: boolean; completed: boolean; }
interface SafetyChecklist { id: string; visitId: string; items: ChecklistItem[]; completed: boolean; }

export default function SafetyPage() {
  const [visitId, setVisitId] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState<SafetyChecklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (showChecklist && visitId) fetchChecklist(); }, [showChecklist, visitId]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/safety/visit/${visitId}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (result.success) setChecklist(result.data);
      else setError("Failed to load safety checklist");
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const handleItemToggle = async (itemId: string, completed: boolean) => {
    if (!checklist) return;
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/safety/visit/${visitId}/item/${itemId}`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ completed }),
    });
    const result = await response.json();
    if (result.success) setChecklist(result.data);
  };

  const handleCompleteChecklist = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/safety/visit/${visitId}/complete`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (result.success) setSuccess(true);
    else setError(result.error || "Failed to complete");
    setLoading(false);
  };

  if (success) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-md">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-heading mb-3">Safety Briefing Complete!</h2>
        <p className="text-muted mb-6">You have successfully completed the safety briefing.</p>
        <a href="/kiosk" className="btn btn-primary">Proceed to Check-In</a>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Safety Briefing</h1>
        <p className="text-muted">Required for visitors entering the factory/production area</p>
      </div>

      {!showChecklist ? (
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-heading mb-2">Factory Safety Briefing</h2>
            <p className="text-muted">Complete this briefing before entering the factory floor.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Visit ID</label>
              <input type="text" value={visitId} onChange={(e) => setVisitId(e.target.value)} className="input" placeholder="Enter your visit ID" />
            </div>
            {error && <div className="alert alert-error"><span>{error}</span></div>}
            <button onClick={() => setShowChecklist(true)} disabled={!visitId.trim()} className="btn btn-primary w-full disabled:opacity-50">Start Safety Briefing</button>
          </div>
        </div>
      ) : checklist ? (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-heading">Safety Checklist</h2>
              <p className="text-lg font-bold text-heading">{checklist.items.filter(i => i.completed).length}/{checklist.items.length}</p>
            </div>
            <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-success transition-all duration-300" style={{ width: `${(checklist.items.filter(i => i.completed).length / checklist.items.length) * 100}%` }} />
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {checklist.items.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${item.completed ? "bg-success/5 border-success/20" : "bg-white border-neutral-200"}`}>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" checked={item.completed} onChange={(e) => handleItemToggle(item.id, e.target.checked)} className="mt-1 h-5 w-5 text-success border-neutral-300 rounded" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${item.completed ? "text-success" : "text-heading"}`}>{item.label}</p>
                        {item.required && <span className="badge badge-danger text-xs">Required</span>}
                      </div>
                      <p className="text-sm text-muted mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer flex items-center justify-between">
            <button onClick={() => setShowChecklist(false)} className="btn btn-ghost">Back</button>
            <button onClick={handleCompleteChecklist} disabled={!checklist.items.filter(i => i.required).every(i => i.completed) || loading} className="btn btn-success disabled:opacity-50">
              {loading ? "Completing..." : "Complete Safety Briefing"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
