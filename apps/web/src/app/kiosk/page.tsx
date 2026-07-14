"use client";

import { useState, useEffect } from "react";

type Step = "welcome" | "details" | "host" | "confirm" | "complete";

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface Site {
  id: string;
  name: string;
}

interface VisitorData {
  name: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  hostId: string;
  hostName: string;
  siteId: string;
}

export default function KioskPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [visitorData, setVisitorData] = useState<VisitorData>({
    name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hostSearch, setHostSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, siteRes] = await Promise.all([
          fetch("http://localhost:3001/api/employees/public"),
          fetch("http://localhost:3001/api/sites/public"),
        ]);
        const empData = await empRes.json();
        const siteData = await siteRes.json();
        if (empData.success) setEmployees(empData.data || []);
        if (siteData.success) {
          const list = siteData.data || [];
          setSites(list);
          if (list.length > 0) setVisitorData((prev) => ({ ...prev, siteId: list[0].id }));
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const steps: Step[] = ["welcome", "details", "host", "confirm", "complete"];
  const stepLabels = ["Welcome", "Info", "Host", "Confirm", "Done"];

  const handleNext = () => {
    const i = steps.indexOf(step);
    if (i < steps.length - 1) setStep(steps[i + 1]);
  };

  const handleBack = () => {
    const i = steps.indexOf(step);
    if (i > 0) setStep(steps[i - 1]);
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const visRes = await fetch("http://localhost:3001/api/visitors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: visitorData.name, email: visitorData.email || undefined, phone: visitorData.phone || undefined, company: visitorData.company || undefined }),
      });
      const visResult = await visRes.json();
      if (!visResult.success) throw new Error(visResult.error);

      const visitRes = await fetch("http://localhost:3001/api/visits/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: visResult.data.id, hostId: visitorData.hostId, siteId: visitorData.siteId, purpose: visitorData.purpose, visitorType: "guest" }),
      });
      const visitResult = await visitRes.json();
      if (!visitResult.success) throw new Error(visitResult.error);
      handleNext();
    } catch (err) { setError(err instanceof Error ? err.message : "Error occurred"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-2xl bg-base-100 shadow-2xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-content px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 flex items-center justify-center rounded-lg font-bold text-xl">V</div>
            <div>
              <h1 className="text-xl font-bold">Visitor Management</h1>
              <p className="text-sm opacity-80">Check-In Kiosk</p>
            </div>
          </div>
          <ul className="steps steps-horizontal w-full">
            {stepLabels.map((label, i) => (
              <li key={label} className={`step ${i < steps.indexOf(step) ? "step-primary" : i === steps.indexOf(step) ? "step-primary" : ""}`}>{label}</li>
            ))}
          </ul>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === "welcome" && (
            <div className="text-center">
              <div className="text-8xl mb-6">:)</div>
              <h2 className="text-3xl font-bold mb-3">Welcome</h2>
              <p className="text-base-content/60 mb-8">Check in to begin your visit</p>
              <button onClick={handleNext} className="btn btn-primary btn-lg w-full">Start Check-In</button>
            </div>
          )}

          {step === "details" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Information</h2>
              <div className="space-y-4">
                <div className="form-control"><label className="label"><span className="label-text">Full Name *</span></label><input type="text" value={visitorData.name} onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })} className="input input-bordered" placeholder="Enter your full name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control"><label className="label"><span className="label-text">Email</span></label><input type="email" value={visitorData.email} onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })} className="input input-bordered" placeholder="you@company.com" /></div>
                  <div className="form-control"><label className="label"><span className="label-text">Phone</span></label><input type="tel" value={visitorData.phone} onChange={(e) => setVisitorData({ ...visitorData, phone: e.target.value })} className="input input-bordered" placeholder="+1 (555) 000-0000" /></div>
                </div>
                <div className="form-control"><label className="label"><span className="label-text">Company</span></label><input type="text" value={visitorData.company} onChange={(e) => setVisitorData({ ...visitorData, company: e.target.value })} className="input input-bordered" placeholder="Your company" /></div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn btn-ghost">Back</button>
                <button onClick={handleNext} disabled={!visitorData.name} className="btn btn-primary">Continue</button>
              </div>
            </div>
          )}

          {step === "host" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Select Host</h2>
              <div className="space-y-4">
                <div className="form-control"><label className="label"><span className="label-text">Search Host *</span></label><input type="text" value={hostSearch} onChange={(e) => setHostSearch(e.target.value)} className="input input-bordered" placeholder="Type to search..." /></div>
                {hostSearch && !visitorData.hostId && (
                  <div className="max-h-48 overflow-y-auto border border-base-300 rounded-lg">
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase()) || e.email.toLowerCase().includes(hostSearch.toLowerCase())).slice(0, 10).map((emp) => (
                      <button key={emp.id} type="button" onClick={() => { setVisitorData({ ...visitorData, hostId: emp.id, hostName: emp.name }); setHostSearch(emp.name); }} className="w-full text-left px-4 py-3 hover:bg-base-200 border-b border-base-300 last:border-0">
                        <div className="font-bold">{emp.name}</div>
                        <div className="text-xs text-base-content/60">{emp.email}</div>
                      </button>
                    ))}
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase())).length === 0 && <div className="px-4 py-3 text-base-content/60 text-sm">No hosts found</div>}
                  </div>
                )}
                {visitorData.hostId && (
                  <div className="p-4 bg-success/10 border border-success rounded-lg flex justify-between items-center">
                    <div><p className="font-bold text-success">{visitorData.hostName}</p><p className="text-xs text-success/70">Selected host</p></div>
                    <button type="button" onClick={() => { setVisitorData({ ...visitorData, hostId: "", hostName: "" }); setHostSearch(""); }} className="btn btn-ghost btn-xs">Change</button>
                  </div>
                )}
                <div className="form-control"><label className="label"><span className="label-text">Purpose</span></label>
                  <select value={visitorData.purpose} onChange={(e) => setVisitorData({ ...visitorData, purpose: e.target.value })} className="select select-bordered">
                    <option value="">Select purpose</option><option>Business Meeting</option><option>Interview</option><option>Delivery</option><option>Maintenance</option><option>Client Visit</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn btn-ghost">Back</button>
                <button onClick={handleNext} disabled={!visitorData.hostId} className="btn btn-primary">Continue</button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Confirm Details</h2>
              <div className="bg-base-200 p-6 rounded-lg space-y-3">
                <div className="flex justify-between"><span className="text-base-content/60">Name:</span><span className="font-bold">{visitorData.name}</span></div>
                {visitorData.email && <div className="flex justify-between"><span className="text-base-content/60">Email:</span><span>{visitorData.email}</span></div>}
                {visitorData.phone && <div className="flex justify-between"><span className="text-base-content/60">Phone:</span><span>{visitorData.phone}</span></div>}
                {visitorData.company && <div className="flex justify-between"><span className="text-base-content/60">Company:</span><span>{visitorData.company}</span></div>}
                <div className="flex justify-between"><span className="text-base-content/60">Host:</span><span className="text-primary font-bold">{visitorData.hostName}</span></div>
                {visitorData.purpose && <div className="flex justify-between"><span className="text-base-content/60">Purpose:</span><span>{visitorData.purpose}</span></div>}
              </div>
              {error && <div className="alert alert-error mt-4"><span>{error}</span></div>}
              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn btn-ghost">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-success btn-lg">
                  {loading ? <span className="loading loading-spinner loading-sm"></span> : "Complete Check-In"}
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center">
              <div className="text-8xl mb-6">:D</div>
              <h2 className="text-3xl font-bold text-success mb-3">Check-In Complete!</h2>
              <p className="text-lg mb-2">Welcome, <span className="font-bold text-primary">{visitorData.name}</span></p>
              <p className="text-base-content/60 mb-8">{visitorData.hostName} has been notified.</p>
              <button onClick={() => { setStep("welcome"); setVisitorData({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: "" }); setHostSearch(""); }} className="btn btn-primary">Check In Another</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
