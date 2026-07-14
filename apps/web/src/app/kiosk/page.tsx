"use client";

import { useState, useEffect } from "react";

type Step = "welcome" | "details" | "host" | "confirm" | "complete";
interface Employee { id: string; name: string; email: string; designation?: string; department?: string; siteId?: string; }
interface Site { id: string; name: string; }
interface VisitorData { name: string; email: string; phone: string; company: string; purpose: string; hostId: string; hostName: string; siteId: string; }

export default function KioskPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<VisitorData>({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hostSearch, setHostSearch] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [e, s] = await Promise.all([fetch("http://localhost:3001/api/employees/public"), fetch("http://localhost:3001/api/sites/public")]);
        const ed = await e.json(), sd = await s.json();
        if (ed.success) setEmployees(ed.data || []);
        if (sd.success) { const l = sd.data || []; setSites(l); if (l.length > 0) setData((p) => ({ ...p, siteId: l[0].id })); }
      } catch (err) { console.error(err); }
    })();
  }, []);

  const steps: Step[] = ["welcome", "details", "host", "confirm", "complete"];
  const labels = ["Welcome", "Info", "Host", "Confirm", "Done"];
  const idx = steps.indexOf(step);
  const next = () => { if (idx < steps.length - 1) setStep(steps[idx + 1]); };
  const back = () => { if (idx > 0) setStep(steps[idx - 1]); };

  const lookupQR = async () => {
    if (!qrCode.trim()) return;
    setQrLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/badges/lookup?qrCode=${encodeURIComponent(qrCode.trim())}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        const badge = result.data;
        if (badge.visit) {
          setData({
            name: badge.visit.visitor?.name || "",
            email: badge.visit.visitor?.email || "",
            phone: badge.visit.visitor?.phone || "",
            company: badge.visit.visitor?.company || "",
            purpose: badge.visit.purpose || "",
            hostId: badge.visit.hostId || "",
            hostName: badge.visit.host?.name || "",
            siteId: badge.visit.siteId || "",
          });
          setStep("confirm");
        }
      } else {
        setError(result.error || "Invalid QR code");
      }
    } catch (err) {
      setError("Failed to look up QR code");
    } finally {
      setQrLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const vr = await fetch("http://localhost:3001/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.name, email: data.email || undefined, phone: data.phone || undefined, company: data.company || undefined }) });
      const vd = await vr.json(); if (!vd.success) throw new Error(vd.error);
      const tr = await fetch("http://localhost:3001/api/visits/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId: vd.data.id, hostId: data.hostId, siteId: data.siteId, purpose: data.purpose, visitorType: "guest" }) });
      const td = await tr.json(); if (!td.success) throw new Error(td.error);
      next();
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface shadow-xl rounded-xl overflow-hidden">
        <div className="bg-brand-gradient text-white px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 flex items-center justify-center rounded-lg font-bold text-xl">V</div>
            <div><h1 className="text-xl font-bold">Visitor Management</h1><p className="text-sm opacity-80">Check-In Kiosk</p></div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {labels.map((l, i) => (
              <div key={l} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < idx ? "bg-success text-white" : i === idx ? "bg-white text-brand" : "bg-white/30 text-white/70"}`}>{i < idx ? "✓" : i + 1}</div>
                {i < 4 && <div className={`flex-1 h-1 mx-2 ${i < idx ? "bg-success" : "bg-white/30"}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === "welcome" && (
            <div className="text-center">
              <div className="text-8xl mb-6">:)</div>
              <h2 className="text-3xl font-bold text-heading mb-3">Welcome</h2>
              <p className="text-muted mb-8">Check in to begin your visit</p>

              {/* QR Code Option */}
              <div className="mb-6 p-4 bg-bg-page rounded-lg">
                <p className="text-sm text-muted mb-3">Have a QR code? Scan it here</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && lookupQR()}
                    className="input flex-1"
                    placeholder="Scan or enter QR code"
                  />
                  <button onClick={lookupQR} disabled={qrLoading || !qrCode.trim()} className="btn btn-accent">
                    {qrLoading ? <span className="loading"></span> : "Scan"}
                  </button>
                </div>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-surface text-muted">or</span>
                </div>
              </div>

              <button onClick={next} className="btn btn-primary btn-lg w-full">Walk-In Check-In</button>
            </div>
          )}

          {step === "details" && (
            <div>
              <h2 className="text-2xl font-bold text-heading mb-6">Your Information</h2>
              <div className="space-y-4">
                <div><label className="label">Full Name *</label><input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="input" placeholder="Enter your full name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input" placeholder="you@company.com" /></div>
                  <div><label className="label">Phone</label><input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="input" placeholder="+1 (555) 000-0000" /></div>
                </div>
                <div><label className="label">Company</label><input type="text" value={data.company} onChange={(e) => setData({ ...data, company: e.target.value })} className="input" placeholder="Your company" /></div>
              </div>
              <div className="flex justify-between mt-8"><button onClick={back} className="btn btn-ghost">Back</button><button onClick={next} disabled={!data.name} className="btn btn-primary">Continue</button></div>
            </div>
          )}

          {step === "host" && (
            <div>
              <h2 className="text-2xl font-bold text-heading mb-6">Select Host</h2>
              <div className="space-y-4">
                <div><label className="label">Search Host *</label><input type="text" value={hostSearch} onChange={(e) => setHostSearch(e.target.value)} className="input" placeholder="Type to search..." /></div>
                {hostSearch && !data.hostId && (
                  <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg">
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase()) || e.email.toLowerCase().includes(hostSearch.toLowerCase())).slice(0, 10).map((emp) => (
                      <button key={emp.id} type="button" onClick={() => { setData({ ...data, hostId: emp.id, hostName: emp.name }); setHostSearch(emp.name); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                        <div className="font-medium text-heading">{emp.name}</div>
                        {emp.designation && <div className="text-xs text-brand">{emp.designation}</div>}
                        <div className="text-xs text-muted">{emp.email}</div>
                      </button>
                    ))}
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase())).length === 0 && <div className="px-4 py-3 text-muted text-sm">No hosts found</div>}
                  </div>
                )}
                {data.hostId && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex justify-between items-center">
                    <div><p className="font-medium text-success">{data.hostName}</p><p className="text-xs text-success/70">Selected host</p></div>
                    <button type="button" onClick={() => { setData({ ...data, hostId: "", hostName: "" }); setHostSearch(""); }} className="text-brand hover:underline text-sm font-medium">Change</button>
                  </div>
                )}
                <div><label className="label">Purpose</label><select value={data.purpose} onChange={(e) => setData({ ...data, purpose: e.target.value })} className="select"><option value="">Select purpose</option><option>Business Meeting</option><option>Interview</option><option>Delivery</option><option>Maintenance</option><option>Client Visit</option><option>Other</option></select></div>
              </div>
              <div className="flex justify-between mt-8"><button onClick={back} className="btn btn-ghost">Back</button><button onClick={next} disabled={!data.hostId} className="btn btn-primary">Continue</button></div>
            </div>
          )}

          {step === "confirm" && (
            <div>
              <h2 className="text-2xl font-bold text-heading mb-6">Confirm Details</h2>
              <div className="bg-page p-6 rounded-lg space-y-3">
                <div className="flex justify-between"><span className="text-muted">Name:</span><span className="font-medium text-heading">{data.name}</span></div>
                {data.email && <div className="flex justify-between"><span className="text-muted">Email:</span><span>{data.email}</span></div>}
                {data.phone && <div className="flex justify-between"><span className="text-muted">Phone:</span><span>{data.phone}</span></div>}
                {data.company && <div className="flex justify-between"><span className="text-muted">Company:</span><span>{data.company}</span></div>}
                <div className="flex justify-between"><span className="text-muted">Host:</span><span className="font-medium text-brand">{data.hostName}</span></div>
                {data.purpose && <div className="flex justify-between"><span className="text-muted">Purpose:</span><span>{data.purpose}</span></div>}
              </div>
              {error && <div className="alert alert-error mt-4"><span>{error}</span></div>}
              <div className="flex justify-between mt-8"><button onClick={back} className="btn btn-ghost">Back</button><button onClick={submit} disabled={loading} className="btn btn-success btn-lg">{loading ? <span className="loading"></span> : "Complete Check-In"}</button></div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center">
              <div className="text-8xl mb-6">:D</div>
              <h2 className="text-3xl font-bold text-success mb-3">Check-In Complete!</h2>
              <p className="text-lg text-body mb-2">Welcome, <span className="font-bold text-brand">{data.name}</span></p>
              <p className="text-muted mb-8">{data.hostName} has been notified.</p>
              <button onClick={() => { setStep("welcome"); setData({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: "" }); setHostSearch(""); }} className="btn btn-primary">Check In Another</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
