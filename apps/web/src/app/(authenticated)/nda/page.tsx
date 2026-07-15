"use client";

import { useState } from "react";

export default function NdaPage() {
  const [visitId, setVisitId] = useState("");
  const [showNda, setShowNda] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignNda = async () => {
    if (!signature || !agreeToTerms) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3001/api/nda/visit/${visitId}/sign`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ visitorName, visitorEmail, signature }),
      });
      const result = await response.json();
      if (result.success) setSuccess(true);
      else setError(result.error || "Failed to sign NDA");
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="card p-8 text-center max-w-md">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-heading mb-3">NDA Signed Successfully!</h2>
        <p className="text-muted mb-6">Your non-disclosure agreement has been recorded.</p>
        <a href="/kiosk" className="btn btn-primary">Proceed to Check-In</a>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Non-Disclosure Agreement</h1>
        <p className="text-muted">Required before entering restricted areas</p>
      </div>

      {!showNda ? (
        <div className="card p-8">
          <div className="space-y-4">
            <div>
              <label className="label">Visit ID</label>
              <input type="text" value={visitId} onChange={(e) => setVisitId(e.target.value)} className="input" placeholder="Enter your visit ID" />
            </div>
            {error && <div className="alert alert-error"><span>{error}</span></div>}
            <button onClick={() => setShowNda(true)} disabled={!visitId.trim()} className="btn btn-primary w-full disabled:opacity-50">View NDA</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-heading">Confidentiality Agreement</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg text-sm text-body max-h-60 overflow-y-auto">
              <p className="font-bold mb-2">NON-DISCLOSURE AGREEMENT</p>
              <p className="mb-2">This Non-Disclosure Agreement ("Agreement") is entered into between Aptech Group ("Company") and the undersigned visitor ("Visitor").</p>
              <p className="mb-2">1. The Visitor agrees to keep all confidential information obtained during the visit strictly confidential.</p>
              <p className="mb-2">2. The Visitor shall not disclose, publish, or disseminate any proprietary information, trade secrets, or business operations of the Company.</p>
              <p className="mb-2">3. This obligation of confidentiality shall survive the termination of the visit.</p>
              <p>4. The Visitor acknowledges that unauthorized disclosure may cause irreparable harm to the Company.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Digital Signature (type your full name)</label>
              <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} className="input" placeholder="Type your full name as signature" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="h-4 w-4 text-primary border-neutral-300 rounded" />
              <span className="text-sm text-body">I have read and agree to the terms of this NDA</span>
            </label>
          </div>
          <div className="card-footer flex items-center justify-between">
            <button onClick={() => setShowNda(false)} className="btn btn-ghost">Back</button>
            <button onClick={handleSignNda} disabled={!signature || !agreeToTerms || loading} className="btn btn-primary disabled:opacity-50">{loading ? "Signing..." : "Sign NDA"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
