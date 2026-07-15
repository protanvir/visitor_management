"use client";

import { useState, useEffect, useRef } from "react";

type Step = "welcome" | "phone" | "details" | "visitor-type" | "host" | "confirm" | "badge";
interface Employee { id: string; name: string; email: string; designation?: string; department?: string; phone?: string; siteId?: string; }
interface Site { id: string; name: string; address?: string; }
interface VisitorTypeOption { id: string; name: string; description?: string; color?: string; }
interface VisitorData { name: string; email: string; phone: string; company: string; purpose: string; hostId: string; hostName: string; siteId: string; visitorType: string; visitorTypeId: string; visitorId?: string; }
interface BadgeData { visitId: string; visitorCode: string; visitorName: string; hostName: string; siteName: string; purpose: string; company: string; visitorType: string; qrCode: string; checkInTime: string; badgeId: string; }

export default function KioskPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [data, setData] = useState<VisitorData>({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: "", visitorType: "Guest", visitorTypeId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<VisitorTypeOption[]>([]);
  const [hostSearch, setHostSearch] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [phoneLookup, setPhoneLookup] = useState(false);
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [e, s] = await Promise.all([
          fetch("http://localhost:3001/api/employees/public"),
          fetch("http://localhost:3001/api/sites/public"),
        ]);
        const ed = await e.json(), sd = await s.json();
        if (ed.success) setEmployees(ed.data || []);
        if (sd.success) {
          const l = sd.data || [];
          setSites(l);
          if (l.length > 0) setData((p) => ({ ...p, siteId: l[0].id }));
        }
      } catch (err) { console.error(err); }
    })();
  }, []);

  // Fetch visitor types when site changes
  useEffect(() => {
    if (!data.siteId) return;
    (async () => {
      try {
        // Find organizationId from site - for now use a default
        // In production, you'd get this from the site data
        const res = await fetch(`http://localhost:3001/api/visitor-types?active=true`);
        const result = await res.json();
        if (result.success) {
          setVisitorTypes(result.data || []);
          // Set default visitor type if available
          if (result.data?.length > 0 && !data.visitorTypeId) {
            setData(p => ({ ...p, visitorType: result.data[0].name, visitorTypeId: result.data[0].id }));
          }
        }
      } catch (err) { console.error(err); }
    })();
  }, [data.siteId]);

  const steps: Step[] = ["welcome", "phone", "details", "visitor-type", "host", "confirm", "badge"];
  const labels = ["Welcome", "Phone", "Info", "Type", "Host", "Confirm", "Badge"];
  const idx = steps.indexOf(step);
  const next = () => { if (idx < steps.length - 1) setStep(steps[idx + 1]); };
  const back = () => { if (idx > 0) setStep(steps[idx - 1]); };

  // Phone lookup for returning visitors
  const lookupPhone = async () => {
    if (!data.phone.trim()) { next(); return; }
    setPhoneLookup(true); setError("");
    try {
      const normalizedPhone = data.phone.replace(/\D/g, "");
      const res = await fetch(`http://localhost:3001/api/visitors/lookup/phone/${normalizedPhone}`);
      const result = await res.json();
      if (result.success && result.data) {
        const visitor = result.data;
        setData((prev) => ({
          ...prev,
          visitorId: visitor.id,
          name: visitor.name || prev.name,
          email: visitor.email || prev.email,
          phone: visitor.phone || prev.phone,
          company: visitor.company || prev.company,
        }));
      }
    } catch (err) {
      // Visitor not found - continue with new registration
    } finally {
      setPhoneLookup(false);
      next();
    }
  };

  // QR code lookup
  const lookupQR = async () => {
    if (!qrCode.trim()) return;
    setQrLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/badges/lookup?qrCode=${encodeURIComponent(qrCode.trim())}`, {
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const result = await res.json();
      if (result.success && result.data?.visit) {
        const visit = result.data.visit;
        setBadgeData({
          visitId: visit.id,
          visitorCode: visit.visitor?.visitorCode || "",
          visitorName: visit.visitor?.name || "",
          hostName: visit.host?.name || "",
          siteName: visit.site?.name || "",
          purpose: visit.purpose || "",
          company: visit.visitor?.company || "",
          visitorType: visit.visitorType || "Guest",
          qrCode: result.data.qrCode || "",
          checkInTime: visit.checkInTime || new Date().toISOString(),
          badgeId: result.data.id || "",
        });
        setStep("badge");
      } else {
        setError(result.error || "Invalid QR code");
      }
    } catch (err) {
      setError("Failed to look up QR code");
    } finally {
      setQrLoading(false);
    }
  };

  // Submit check-in
  const submit = async () => {
    setLoading(true); setError("");
    try {
      let visitorId = data.visitorId;

      // Create visitor if new
      if (!visitorId) {
        const vr = await fetch("http://localhost:3001/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email || undefined,
            phone: data.phone || undefined,
            company: data.company || undefined,
          }),
        });
        const vd = await vr.json();
        if (!vd.success) throw new Error(vd.error);
        visitorId = vd.data.id;
      }

      // Check in
      const tr = await fetch("http://localhost:3001/api/visits/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          hostId: data.hostId,
          siteId: data.siteId,
          purpose: data.purpose,
          visitorType: data.visitorType.toLowerCase(),
        }),
      });
      const td = await tr.json();
      if (!td.success) throw new Error(td.error);

      // Set badge data
      if (td.data) {
        setBadgeData({
          visitId: td.data.id,
          visitorCode: td.data.visitor?.visitorCode || "",
          visitorName: td.data.visitor?.name || data.name,
          hostName: td.data.host?.name || data.hostName,
          siteName: td.data.site?.name || "",
          purpose: data.purpose,
          company: data.company,
          visitorType: data.visitorType,
          qrCode: td.data.badge?.qrCode || "",
          checkInTime: td.data.checkInTime || new Date().toISOString(),
          badgeId: td.data.badge?.id || "",
        });
      }

      setStep("badge");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  // Print badge
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Visitor Badge</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
          .badge { border: 2px solid #000; padding: 15px; max-width: 350px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h1 { margin: 0; font-size: 18px; }
          .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
          .visitor-name { font-size: 24px; font-weight: bold; text-align: center; margin: 15px 0; }
          .visitor-type { text-align: center; font-size: 14px; color: #666; margin-bottom: 10px; }
          .info { font-size: 12px; margin: 8px 0; }
          .info strong { display: inline-block; width: 80px; }
          .qr { text-align: center; margin: 15px 0; }
          .qr img { width: 120px; height: 120px; }
          .footer { text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; margin-top: 10px; }
          @media print { body { padding: 0; } .badge { border: 2px solid #000; } }
        </style>
      </head>
      <body>
        <div class="badge">
          <div class="header">
            <h1>VISITOR BADGE</h1>
            <p>Visitor Management System</p>
          </div>
          <div class="visitor-name">${badgeData?.visitorName || ""}</div>
          <div class="visitor-type">${badgeData?.visitorType || ""}</div>
          <div class="info"><strong>Visitor ID:</strong> <strong>${badgeData?.visitorCode || ""}</strong></div>
          <div class="info"><strong>Host:</strong> ${badgeData?.hostName || ""}</div>
          <div class="info"><strong>Site:</strong> ${badgeData?.siteName || ""}</div>
          <div class="info"><strong>Purpose:</strong> ${badgeData?.purpose || ""}</div>
          ${badgeData?.company ? `<div class="info"><strong>Company:</strong> ${badgeData.company}</div>` : ""}
          <div class="info"><strong>Date:</strong> ${badgeData?.checkInTime ? new Date(badgeData.checkInTime).toLocaleDateString() : ""}</div>
          <div class="info"><strong>Time:</strong> ${badgeData?.checkInTime ? new Date(badgeData.checkInTime).toLocaleTimeString() : ""}</div>
          <div class="qr"><img src="${badgeData?.qrCode || ""}" alt="QR Code" /></div>
          <div class="footer">
            <p>Present this badge at reception</p>
            <p>Badge ID: ${badgeData?.badgeId?.slice(0, 12) || ""}</p>
          </div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Reset for new check-in
  const resetKiosk = () => {
    setStep("welcome");
    setData({ name: "", email: "", phone: "", company: "", purpose: "", hostId: "", hostName: "", siteId: sites[0]?.id || "", visitorType: visitorTypes[0]?.name || "Guest", visitorTypeId: visitorTypes[0]?.id || "" });
    setHostSearch("");
    setQrCode("");
    setBadgeData(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-brand flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-brand-gradient text-white px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 flex items-center justify-center rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Visitor Management</h1>
                <p className="text-sm opacity-80">Check-In Kiosk</p>
              </div>
            </div>
            <a href="/" className="text-sm text-white/80 hover:text-white flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
            </a>
          </div>
          {/* Progress Steps */}
          <div className="flex items-center gap-1 mt-4">
            {labels.map((l, i) => (
              <div key={l} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < idx ? "bg-success text-white" : i === idx ? "bg-white text-brand" : "bg-white/30 text-white/70"
                }`}>{i < idx ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}</div>
                {i < labels.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < idx ? "bg-success" : "bg-white/30"}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step: Welcome */}
          {step === "welcome" && (
            <div className="text-center">
              <div className="w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-heading mb-3">Welcome</h2>
              <p className="text-muted mb-8">Check in to begin your visit</p>

              {/* QR Code Option */}
              <div className="mb-4 p-4 bg-bg-page rounded-lg">
                <p className="text-sm text-muted mb-3">Have a pre-registered QR code?</p>
                <div className="flex gap-2">
                  <input type="text" value={qrCode} onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && lookupQR()}
                    className="input flex-1" placeholder="Scan or enter QR code" />
                  <button onClick={lookupQR} disabled={qrLoading || !qrCode.trim()} className="btn btn-primary">
                    {qrLoading ? <span className="loading"></span> : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-surface text-muted">or</span></div>
              </div>

              <button onClick={next} className="btn btn-primary btn-lg w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                New Check-In
              </button>
            </div>
          )}

          {/* Step: Phone */}
          {step === "phone" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Phone Number</h2>
                  <p className="text-muted">Enter your phone number to look up your information</p>
                </div>
              </div>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="label">Phone Number *</label>
                  <input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="input text-lg" placeholder="+880 1XXXXXXXXX" autoFocus />
                </div>
                <p className="text-xs text-muted">Returning visitors: Your information will be auto-filled</p>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={back} className="btn btn-ghost">Back</button>
                <button onClick={lookupPhone} disabled={phoneLookup} className="btn btn-primary">
                  {phoneLookup ? <span className="loading"></span> : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Your Information</h2>
                  {data.visitorId && <p className="text-success text-sm">Returning visitor - information auto-filled</p>}
                </div>
              </div>
              <div className="space-y-4 mt-6">
                <div><label className="label">Full Name *</label><input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="input" placeholder="Enter your full name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className="input" placeholder="you@company.com" /></div>
                  <div><label className="label">Phone</label><input type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="input" placeholder="+880 1XXXXXXXXX" /></div>
                </div>
                <div><label className="label">Company</label><input type="text" value={data.company} onChange={(e) => setData({ ...data, company: e.target.value })} className="input" placeholder="Your company" /></div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={back} className="btn btn-ghost">Back</button>
                <button onClick={next} disabled={!data.name} className="btn btn-primary">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Visitor Type */}
          {step === "visitor-type" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Visitor Type</h2>
                  <p className="text-muted">Select the type of visit</p>
                </div>
              </div>
              <div className="space-y-4 mt-6">
                {visitorTypes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {visitorTypes.map((vt) => (
                      <button
                        key={vt.id}
                        onClick={() => setData({ ...data, visitorType: vt.name, visitorTypeId: vt.id })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          data.visitorTypeId === vt.id
                            ? "border-brand bg-brand/5"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <p className="font-medium text-heading">{vt.name}</p>
                        {vt.description && <p className="text-xs text-muted mt-1">{vt.description}</p>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="label">Visitor Type</label>
                    <select value={data.visitorType} onChange={(e) => setData({ ...data, visitorType: e.target.value })} className="select">
                      <option value="Guest">Guest</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Interview">Interview</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={back} className="btn btn-ghost">Back</button>
                <button onClick={next} className="btn btn-primary">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Host */}
          {step === "host" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Select Host</h2>
                  <p className="text-muted">Who are you visiting?</p>
                </div>
              </div>
              <div className="space-y-4 mt-6">
                <div>
                  <label className="label">Search Host *</label>
                  <input type="text" value={hostSearch} onChange={(e) => setHostSearch(e.target.value)} className="input" placeholder="Type to search..." />
                </div>
                {hostSearch && !data.hostId && (
                  <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg">
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase()) || e.email.toLowerCase().includes(hostSearch.toLowerCase())).slice(0, 10).map((emp) => (
                      <button key={emp.id} type="button" onClick={() => { setData({ ...data, hostId: emp.id, hostName: emp.name }); setHostSearch(emp.name); }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                        <div className="font-medium text-heading">{emp.name}</div>
                        {emp.designation && <div className="text-xs text-brand">{emp.designation}</div>}
                        <div className="text-xs text-muted">{emp.email}</div>
                      </button>
                    ))}
                    {employees.filter((e) => e.name.toLowerCase().includes(hostSearch.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-muted text-sm">No hosts found</div>
                    )}
                  </div>
                )}
                {data.hostId && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-success">{data.hostName}</p>
                      <p className="text-xs text-success/70">Selected host</p>
                    </div>
                    <button type="button" onClick={() => { setData({ ...data, hostId: "", hostName: "" }); setHostSearch(""); }} className="text-brand hover:underline text-sm font-medium">Change</button>
                  </div>
                )}
                <div>
                  <label className="label">Purpose</label>
                  <select value={data.purpose} onChange={(e) => setData({ ...data, purpose: e.target.value })} className="select">
                    <option value="">Select purpose</option>
                    <option>Business Meeting</option>
                    <option>Interview</option>
                    <option>Delivery</option>
                    <option>Maintenance</option>
                    <option>Client Visit</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={back} className="btn btn-ghost">Back</button>
                <button onClick={next} disabled={!data.hostId} className="btn btn-primary">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-heading">Confirm Details</h2>
                  <p className="text-muted">Please verify your information</p>
                </div>
              </div>
              <div className="bg-bg-page p-6 rounded-lg space-y-3 mt-6">
                <div className="flex justify-between"><span className="text-muted">Name:</span><span className="font-medium text-heading">{data.name}</span></div>
                {data.phone && <div className="flex justify-between"><span className="text-muted">Phone:</span><span>{data.phone}</span></div>}
                {data.email && <div className="flex justify-between"><span className="text-muted">Email:</span><span>{data.email}</span></div>}
                {data.company && <div className="flex justify-between"><span className="text-muted">Company:</span><span>{data.company}</span></div>}
                <div className="flex justify-between"><span className="text-muted">Visitor Type:</span><span className="font-medium text-brand">{data.visitorType}</span></div>
                <div className="flex justify-between"><span className="text-muted">Host:</span><span className="font-medium text-brand">{data.hostName}</span></div>
                {data.purpose && <div className="flex justify-between"><span className="text-muted">Purpose:</span><span>{data.purpose}</span></div>}
              </div>
              {error && <div className="alert alert-error mt-4"><span>{error}</span></div>}
              <div className="flex justify-between mt-8">
                <button onClick={back} className="btn btn-ghost">Back</button>
                <button onClick={submit} disabled={loading} className="btn btn-success btn-lg">
                  {loading ? <span className="loading"></span> : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Check-In
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Badge */}
          {step === "badge" && badgeData && (
            <div>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-success mb-2">Check-In Complete!</h2>
                <p className="text-muted">Your visitor badge is ready</p>
              </div>

              {/* Badge Display */}
              <div ref={printRef} className="border-2 border-heading rounded-lg p-6 mb-6">
                <div className="text-center border-b-2 border-heading pb-4 mb-4">
                  <h3 className="text-lg font-bold text-heading">VISITOR BADGE</h3>
                  <p className="text-xs text-muted">Visitor Management System</p>
                </div>

                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-heading">{badgeData.visitorName}</p>
                  <p className="text-sm text-muted">{badgeData.visitorType}</p>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex"><span className="w-24 font-medium text-muted">Visitor ID:</span><span className="text-heading font-mono font-bold">{badgeData.visitorCode}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-muted">Host:</span><span className="text-heading">{badgeData.hostName}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-muted">Site:</span><span className="text-heading">{badgeData.siteName}</span></div>
                  {badgeData.purpose && <div className="flex"><span className="w-24 font-medium text-muted">Purpose:</span><span className="text-heading">{badgeData.purpose}</span></div>}
                  {badgeData.company && <div className="flex"><span className="w-24 font-medium text-muted">Company:</span><span className="text-heading">{badgeData.company}</span></div>}
                  <div className="flex"><span className="w-24 font-medium text-muted">Date:</span><span className="text-heading">{new Date(badgeData.checkInTime).toLocaleDateString()}</span></div>
                  <div className="flex"><span className="w-24 font-medium text-muted">Time:</span><span className="text-heading">{new Date(badgeData.checkInTime).toLocaleTimeString()}</span></div>
                </div>

                {badgeData.qrCode && (
                  <div className="text-center border-t-2 border-heading pt-4">
                    <img src={badgeData.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
                    <p className="text-xs text-muted mt-2">Scan for check-out</p>
                  </div>
                )}

                <div className="text-center text-xs text-muted mt-4 pt-4 border-t border-neutral-200">
                  <p>Badge ID: {badgeData.badgeId.slice(0, 12)}...</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handlePrint} className="btn btn-primary flex-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Badge
                </button>
                <button onClick={resetKiosk} className="btn btn-accent flex-1">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Check In Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
