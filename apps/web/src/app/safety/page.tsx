"use client";

import { useEffect, useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
}

interface SafetyChecklist {
  id: string;
  visitId: string;
  items: ChecklistItem[];
  completed: boolean;
}

export default function SafetyPage() {
  const [visitId, setVisitId] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklist, setChecklist] = useState<SafetyChecklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (showChecklist && visitId) {
      fetchChecklist();
    }
  }, [showChecklist, visitId]);

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/safety/visit/${visitId}`);
      const result = await response.json();

      if (result.success) {
        setChecklist(result.data);
      } else {
        setError("Failed to load safety checklist");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (itemId: string, completed: boolean) => {
    if (!checklist) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/safety/visit/${visitId}/item/${itemId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setChecklist(result.data);
      }
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  const handleCompleteChecklist = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3001/api/safety/visit/${visitId}/complete`,
        { method: "POST" }
      );

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to complete safety briefing");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-900 rounded-corporate flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="font-bold text-primary-900">Aptech Group</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="card-corporate p-8 text-center">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-900 mb-3">Safety Briefing Complete!</h2>
            <p className="text-neutral-500 mb-6">
              You have successfully completed the safety briefing for the factory/production area.
              Please follow all safety protocols during your visit.
            </p>
            <div className="bg-success-50 border border-success-200 rounded-corporate p-4 mb-6">
              <p className="text-sm text-success-700">
                <strong>Reminder:</strong> Always wear your visitor badge and follow your host's instructions.
              </p>
            </div>
            <a href="/kiosk" className="btn-accent">
              Proceed to Check-In
            </a>
          </div>
        </main>
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
                <h1 className="text-lg font-bold text-primary-900">Safety Briefing</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!showChecklist ? (
          <div className="card-corporate p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-900 mb-2">Factory Safety Briefing</h2>
              <p className="text-neutral-500 max-w-md mx-auto">
                Required for all visitors entering the factory/production area. 
                This briefing takes approximately 5-10 minutes.
              </p>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-corporate p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-warning-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-warning-800">Important</p>
                  <p className="text-sm text-warning-700">
                    You must complete this safety briefing before entering the factory floor. 
                    Failure to do so may result in denial of access.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Visit ID
                </label>
                <input
                  type="text"
                  value={visitId}
                  onChange={(e) => setVisitId(e.target.value)}
                  className="input-corporate"
                  placeholder="Enter your visit ID"
                />
              </div>

              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={() => setShowChecklist(true)}
                disabled={!visitId.trim()}
                className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Safety Briefing
              </button>
            </div>
          </div>
        ) : checklist ? (
          <div className="space-y-6">
            <div className="card-corporate">
              <div className="card-corporate-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-primary-900">Safety Checklist</h2>
                    <p className="text-sm text-neutral-500">
                      Complete all required items to proceed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Progress</p>
                    <p className="text-lg font-bold text-primary-900">
                      {checklist.items.filter((i) => i.completed).length}/{checklist.items.length}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-500 transition-all duration-300"
                    style={{
                      width: `${(checklist.items.filter((i) => i.completed).length / checklist.items.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="card-corporate-body">
                <div className="space-y-4">
                  {checklist.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-corporate border ${
                        item.completed
                          ? "bg-success-50 border-success-200"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => handleItemToggle(item.id, e.target.checked)}
                          className="mt-1 h-5 w-5 text-success-600 border-neutral-300 rounded focus:ring-success-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${item.completed ? "text-success-700" : "text-primary-900"}`}>
                              {item.label}
                            </p>
                            {item.required && (
                              <span className="badge badge-danger text-xs">Required</span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${item.completed ? "text-success-600" : "text-neutral-500"}`}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-corporate-footer">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowChecklist(false)}
                    className="btn-ghost"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCompleteChecklist}
                    disabled={!checklist.items.filter((i) => i.required).every((i) => i.completed) || loading}
                    className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Completing..." : "Complete Safety Briefing"}
                  </button>
                </div>
              </div>
            </div>

            <div className="card-corporate p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-info-100 rounded-corporate flex items-center justify-center">
                  <svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-primary-900">Need Help?</p>
                  <p className="text-sm text-neutral-500">
                    If you have any questions about safety procedures, please ask your host 
                    or contact reception at extension 100.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
