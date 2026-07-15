"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

interface Visit {
  id: string;
  purpose: string | null;
  visitorType: string;
  status: string;
  expectedArrival: string | null;
  expectedDeparture: string | null;
  checkInTime: string | null;
  createdAt: string;
  visitor: { id: string; name: string; email: string | null; phone: string | null; company: string | null };
  host: { id: string; name: string; email: string };
  site: { id: string; name: string };
  badge: { id: string; qrCode: string; expiresAt: string } | null;
}

interface Employee { id: string; name: string; email: string; designation: string | null; }
interface Site { id: string; name: string; }
interface VisitorType { id: string; name: string; }
interface Visitor { id: string; name: string; email: string | null; phone: string | null; company: string | null; visitorCode: string; }

export default function PreRegisterPage() {
  const { user } = useAuth();

  // Visit list state
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorResults, setVisitorResults] = useState<Visitor[]>([]);
  const [hostSearch, setHostSearch] = useState("");
  const [hostResults, setHostResults] = useState<Employee[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);

  const [formData, setFormData] = useState({
    visitorName: "",
    visitorEmail: "",
    visitorPhone: "",
    visitorCompany: "",
    visitorId: "",
    hostId: "",
    hostName: "",
    siteId: "",
    purpose: "",
    visitorType: "guest",
    expectedArrival: "",
    expectedDeparture: "",
  });

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailVisit, setEmailVisit] = useState<Visit | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Badge modal state
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeVisit, setBadgeVisit] = useState<Visit | null>(null);
  const [generatingBadge, setGeneratingBadge] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hostSearchRef = useRef<HTMLDivElement>(null);
  const visitorSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchVisits(); fetchSites(); fetchVisitorTypes(); }, []);
  useEffect(() => { const handleClick = (e: MouseEvent) => { if (hostSearchRef.current && !hostSearchRef.current.contains(e.target as Node)) setHostResults([]); if (visitorSearchRef.current && !visitorSearchRef.current.contains(e.target as Node)) setVisitorResults([]); }; document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick); }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/visits?pageSize=50&sortBy=createdAt&sortOrder=desc", { headers: { Authorization: `Bearer ${token}` } });
      const r = await res.json();
      if (r.success) {
        const data = r.data.data || r.data;
        setVisits(Array.isArray(data) ? data.filter((v: Visit) => ["pending", "approved"].includes(v.status) || (v.badge && !v.checkInTime)) : []);
      } else setError(r.error);
    } catch (e) { setError("Failed to load visits"); }
    finally { setLoading(false); }
  };

  const fetchSites = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/sites", { headers: { Authorization: `Bearer ${token}` } });
      const r = await res.json();
      if (r.success) setSites(r.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchVisitorTypes = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/visitor-types", { headers: { Authorization: `Bearer ${token}` } });
      const r = await res.json();
      if (r.success) setVisitorTypes(r.data || []);
    } catch (e) { console.error(e); }
  };

  const searchHosts = async (query: string) => {
    if (query.length < 2) { setHostResults([]); return; }
    try {
      const token = getToken();
      const res = await fetch(`/api/employees?search=${encodeURIComponent(query)}&pageSize=5`, { headers: { Authorization: `Bearer ${token}` } });
      const r = await res.json();
      if (r.success) setHostResults(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const searchVisitors = async (query: string) => {
    if (query.length < 2) { setVisitorResults([]); return; }
    try {
      const token = getToken();
      const res = await fetch(`/api/visitors?search=${encodeURIComponent(query)}&pageSize=5`, { headers: { Authorization: `Bearer ${token}` } });
      const r = await res.json();
      if (r.success) setVisitorResults(r.data.data || []);
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setFormData({ visitorName: "", visitorEmail: "", visitorPhone: "", visitorCompany: "", visitorId: "", hostId: "", hostName: "", siteId: "", purpose: "", visitorType: "guest", expectedArrival: "", expectedDeparture: "" });
    setVisitorSearch("");
    setHostSearch("");
  };

  const handleCreateVisit = async () => {
    setFormError("");
    if (!formData.visitorName || !formData.hostId || !formData.siteId) {
      setFormError("Visitor name, host, and site are required");
      return;
    }
    setFormLoading(true);
    try {
      const token = getToken();

      // Create visitor if not selected from search
      let visitorId = formData.visitorId;
      if (!visitorId) {
        const visitorRes = await fetch("/api/visitors", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: formData.visitorName,
            email: formData.visitorEmail || undefined,
            phone: formData.visitorPhone || undefined,
            company: formData.visitorCompany || undefined,
          }),
        });
        const visitorR = await visitorRes.json();
        if (!visitorR.success) { setFormError(visitorR.error || "Failed to create visitor"); setFormLoading(false); return; }
        visitorId = visitorR.data.id;
      }

      // Create visit
      const body: any = {
        visitorId,
        hostId: formData.hostId,
        siteId: formData.siteId,
        purpose: formData.purpose || undefined,
        visitorType: formData.visitorType,
      };
      if (formData.expectedArrival) body.expectedArrival = new Date(formData.expectedArrival).toISOString();
      if (formData.expectedDeparture) body.expectedDeparture = new Date(formData.expectedDeparture).toISOString();

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const r = await res.json();
      if (r.success) {
        setShowForm(false);
        resetForm();
        fetchVisits();
      } else {
        setFormError(r.error || "Failed to create visit");
      }
    } catch (e) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleGenerateBadge = async (visitId: string) => {
    setGeneratingBadge(visitId);
    try {
      const token = getToken();
      const res = await fetch(`/api/visits/${visitId}/generate-badge`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const r = await res.json();
      if (r.success) {
        fetchVisits();
        // Show badge modal
        const visit = visits.find(v => v.id === visitId);
        if (visit) {
          setBadgeVisit({ ...visit, badge: r.data.badge });
          setShowBadgeModal(true);
        }
      } else {
        alert(r.error || "Failed to generate badge");
      }
    } catch (e) { alert("Failed to generate badge"); }
    finally { setGeneratingBadge(null); }
  };

  const handleSendEmail = (visit: Visit) => {
    setEmailVisit(visit);
    setEmailTo(visit.visitor.email || "");
    setEmailResult(null);
    setShowEmailModal(true);
  };

  const sendBadgeEmail = async () => {
    if (!emailVisit || !emailTo) return;
    setEmailLoading(true);
    setEmailResult(null);
    try {
      const token = getToken();
      const res = await fetch(`/api/visits/${emailVisit.id}/send-badge-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visitorEmail: emailTo }),
      });
      const r = await res.json();
      setEmailResult({ success: r.success, message: r.success ? "Email sent successfully" : (r.error || "Failed to send email") });
      if (r.success) setTimeout(() => setShowEmailModal(false), 2000);
    } catch (e) { setEmailResult({ success: false, message: "Failed to connect" }); }
    finally { setEmailLoading(false); }
  };

  const handleDownloadBadge = (visit: Visit) => {
    if (!visit.badge?.qrCode) return;
    const link = document.createElement("a");
    link.href = visit.badge.qrCode;
    link.download = `badge-${visit.visitor.name.replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const handleCopyLink = (visitId: string) => {
    const url = `${window.location.origin}/badge?visitId=${visitId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString() : "—";
  const statusColors: Record<string, string> = { pending: "badge-warning", approved: "badge-success", checked_in: "badge-primary", checked_out: "badge-neutral", cancelled: "badge-error" };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Pre-Register Visitor</h1>
          <p className="text-muted">Create visits and send badges to upcoming visitors</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          New Pre-Registration
        </button>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {/* Visit List */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : visits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Host</th>
                  <th>Site</th>
                  <th>Purpose</th>
                  <th>Expected Arrival</th>
                  <th>Status</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <div>
                        <p className="font-medium text-heading">{v.visitor.name}</p>
                        {v.visitor.company && <p className="text-xs text-muted">{v.visitor.company}</p>}
                        {v.visitor.email && <p className="text-xs text-muted">{v.visitor.email}</p>}
                      </div>
                    </td>
                    <td className="text-muted">{v.host.name}</td>
                    <td className="text-muted">{v.site.name}</td>
                    <td className="text-muted">{v.purpose || "—"}</td>
                    <td className="text-muted text-sm">{formatDate(v.expectedArrival)}</td>
                    <td><span className={`badge ${statusColors[v.status] || "badge-primary"}`}>{v.status.replace("_", " ")}</span></td>
                    <td>
                      {v.badge ? (
                        <span className="badge badge-success">Generated</span>
                      ) : (
                        <span className="text-xs text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {!v.badge && (
                          <button
                            onClick={() => handleGenerateBadge(v.id)}
                            disabled={generatingBadge === v.id}
                            className="btn btn-ghost btn-sm text-brand"
                            title="Generate Badge"
                          >
                            {generatingBadge === v.id ? (
                              <div className="loading w-4 h-4"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                            )}
                          </button>
                        )}
                        {v.badge && (
                          <>
                            <button onClick={() => { setBadgeVisit(v); setShowBadgeModal(true); }} className="btn btn-ghost btn-sm text-brand" title="View Badge">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => handleDownloadBadge(v)} className="btn btn-ghost btn-sm text-brand" title="Download Badge">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                            <button onClick={() => handleSendEmail(v)} className="btn btn-ghost btn-sm text-brand" title="Send Email">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </button>
                          </>
                        )}
                        <button onClick={() => handleCopyLink(v.id)} className={`btn btn-ghost btn-sm ${copied ? "text-success" : "text-muted"}`} title="Copy Link">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            <svg className="w-12 h-12 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p>No pre-registered visits yet</p>
            <p className="text-sm mt-1">Click "New Pre-Registration" to create one</p>
          </div>
        )}
      </div>

      {/* Create Visit Modal */}
      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">New Pre-Registration</h3>
            {formError && <div className="alert alert-error mb-4"><span>{formError}</span></div>}

            <div className="space-y-4">
              {/* Visitor Section */}
              <div>
                <h4 className="text-sm font-semibold text-heading mb-3">Visitor Information</h4>
                <div className="space-y-3" ref={visitorSearchRef}>
                  <div className="relative">
                    <label className="label">Search Existing Visitor</label>
                    <input type="text" value={visitorSearch} onChange={(e) => { setVisitorSearch(e.target.value); searchVisitors(e.target.value); }} className="input" placeholder="Search by name, email, or code..." />
                    {visitorResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-neutral-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {visitorResults.map((v) => (
                          <button key={v.id} onClick={() => { setFormData({ ...formData, visitorId: v.id, visitorName: v.name, visitorEmail: v.email || "", visitorPhone: v.phone || "", visitorCompany: v.company || "" }); setVisitorSearch(""); setVisitorResults([]); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                            <p className="font-medium text-heading text-sm">{v.name}</p>
                            <p className="text-xs text-muted">{v.email || v.phone || v.visitorCode}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Visitor Name *</label><input type="text" value={formData.visitorName} onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })} className="input" /></div>
                    <div><label className="label">Email</label><input type="email" value={formData.visitorEmail} onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })} className="input" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Phone</label><input type="tel" value={formData.visitorPhone} onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })} className="input" /></div>
                    <div><label className="label">Company</label><input type="text" value={formData.visitorCompany} onChange={(e) => setFormData({ ...formData, visitorCompany: e.target.value })} className="input" /></div>
                  </div>
                </div>
              </div>

              {/* Host Section */}
              <div ref={hostSearchRef}>
                <h4 className="text-sm font-semibold text-heading mb-3">Host Information</h4>
                <div className="relative">
                  <label className="label">Search Host *</label>
                  <input type="text" value={hostSearch} onChange={(e) => { setHostSearch(e.target.value); searchHosts(e.target.value); }} className="input" placeholder="Search by name or email..." />
                  {hostResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-neutral-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                      {hostResults.map((h) => (
                        <button key={h.id} onClick={() => { setFormData({ ...formData, hostId: h.id, hostName: h.name }); setHostSearch(h.name); setHostResults([]); }} className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0">
                          <p className="font-medium text-heading text-sm">{h.name}</p>
                          <p className="text-xs text-muted">{h.email}{h.designation ? ` — ${h.designation}` : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.hostName && <p className="text-sm text-brand mt-1">Selected: {formData.hostName}</p>}
              </div>

              {/* Visit Details */}
              <div>
                <h4 className="text-sm font-semibold text-heading mb-3">Visit Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Site *</label>
                    <select value={formData.siteId} onChange={(e) => setFormData({ ...formData, siteId: e.target.value })} className="input">
                      <option value="">Select site...</option>
                      {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Visitor Type</label>
                    <select value={formData.visitorType} onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })} className="input">
                      <option value="guest">Guest</option>
                      <option value="contractor">Contractor</option>
                      <option value="vendor">Vendor</option>
                      <option value="delivery">Delivery</option>
                      <option value="interview">Interview</option>
                      {visitorTypes.map((vt) => <option key={vt.id} value={vt.name.toLowerCase()}>{vt.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="label">Purpose</label>
                  <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="input" placeholder="e.g., Meeting, Interview, Delivery..." />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="label">Expected Arrival</label><input type="datetime-local" value={formData.expectedArrival} onChange={(e) => setFormData({ ...formData, expectedArrival: e.target.value })} className="input" /></div>
                  <div><label className="label">Expected Departure</label><input type="datetime-local" value={formData.expectedDeparture} onChange={(e) => setFormData({ ...formData, expectedDeparture: e.target.value })} className="input" /></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleCreateVisit} disabled={formLoading} className="btn btn-primary">
                {formLoading ? "Creating..." : "Create Visit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && emailVisit && (
        <div className="modal-backdrop" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">Send Badge to Visitor</h3>
            <p className="text-sm text-muted mb-4">
              Send the badge link to <strong>{emailVisit.visitor.name}</strong> via email.
            </p>
            {emailResult && (
              <div className={`alert mb-4 ${emailResult.success ? "alert-success" : "alert-error"}`}>
                <span>{emailResult.message}</span>
              </div>
            )}
            <div>
              <label className="label">Visitor Email</label>
              <input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} className="input" placeholder="visitor@example.com" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEmailModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={sendBadgeEmail} disabled={emailLoading || !emailTo} className="btn btn-primary">
                {emailLoading ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Preview Modal */}
      {showBadgeModal && badgeVisit?.badge && (
        <div className="modal-backdrop" onClick={() => setShowBadgeModal(false)}>
          <div className="modal-content p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">Visitor Badge</h3>
            <div className="bg-white rounded-lg border-2 border-neutral-200 p-6 text-center">
              <div className="mb-4">
                <div className="w-12 h-12 bg-primary-900 text-white flex items-center justify-center rounded-lg font-bold text-lg mx-auto mb-2">A</div>
                <h4 className="font-bold text-primary-900">Aptech Group</h4>
                <p className="text-xs text-muted">Visitor Badge</p>
              </div>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white rounded-lg border border-neutral-200">
                  <img src={badgeVisit.badge.qrCode} alt="QR Code" className="w-40 h-40" />
                </div>
              </div>
              <p className="text-xs text-muted mb-4">Scan this QR code at entry points</p>
              <div className="grid grid-cols-2 gap-3 text-left border-t border-neutral-200 pt-4">
                <div>
                  <p className="text-xs text-muted uppercase">Visitor</p>
                  <p className="text-sm font-semibold text-heading">{badgeVisit.visitor.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">Host</p>
                  <p className="text-sm font-semibold text-heading">{badgeVisit.host.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">Location</p>
                  <p className="text-sm font-semibold text-heading">{badgeVisit.site.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase">Expires</p>
                  <p className="text-sm font-semibold text-heading">{formatDate(badgeVisit.badge.expiresAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => handleDownloadBadge(badgeVisit)} className="btn btn-ghost">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download
              </button>
              <button onClick={() => setShowBadgeModal(false)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
