"use client";

import { useState } from "react";

interface NdaTemplate {
  title: string;
  company: string;
  content: string;
}

export default function NdaPage() {
  const [visitId, setVisitId] = useState("");
  const [showNda, setShowNda] = useState(false);
  const [ndaTemplate, setNdaTemplate] = useState<NdaTemplate | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleLoadNda = async () => {
    if (!visitId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/nda/template");
      const result = await response.json();

      if (result.success) {
        setNdaTemplate(result.data);
        setShowNda(true);
      } else {
        setError("Failed to load NDA template");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleSignNda = async () => {
    if (!visitorName || !visitorEmail || !signature || !agreeToTerms) {
      setError("Please fill in all fields and agree to the terms");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:3001/api/nda/visit/${visitId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorName,
          visitorEmail,
          signature,
          agreeToTerms: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to sign NDA");
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-900 mb-3">NDA Signed Successfully!</h2>
            <p className="text-neutral-500 mb-6">
              Thank you for signing the Non-Disclosure Agreement. You may now proceed with your visit.
            </p>
            <div className="bg-success-50 border border-success-200 rounded-corporate p-4 mb-6">
              <p className="text-sm text-success-700">
                <strong>Reference:</strong> {visitId.slice(0, 8).toUpperCase()}
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
                <h1 className="text-lg font-bold text-primary-900">NDA Signing</h1>
                <p className="text-xs text-neutral-500">Aptech Group Visitor Management</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn-ghost text-sm">Home</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!showNda ? (
          <div className="card-corporate p-8 max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary-900 mb-2">Non-Disclosure Agreement</h2>
              <p className="text-neutral-500">
                Please enter your visit ID to view and sign the NDA
              </p>
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
                onClick={handleLoadNda}
                disabled={!visitId.trim() || loading}
                className="btn-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "View NDA"}
              </button>
            </div>
          </div>
        ) : ndaTemplate ? (
          <div className="space-y-6">
            <div className="card-corporate">
              <div className="card-corporate-header">
                <h2 className="text-xl font-bold text-primary-900">{ndaTemplate.title}</h2>
                <p className="text-sm text-neutral-500">Between {ndaTemplate.company} and Visitor</p>
              </div>
              <div className="card-corporate-body">
                <div className="prose max-w-none text-sm text-neutral-700 whitespace-pre-wrap">
                  {ndaTemplate.content}
                </div>
              </div>
            </div>

            <div className="card-corporate">
              <div className="card-corporate-header">
                <h3 className="text-lg font-semibold text-primary-900">Sign the NDA</h3>
              </div>
              <div className="card-corporate-body">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Full Name <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="input-corporate"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Email Address <span className="text-danger-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        className="input-corporate"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Signature <span className="text-danger-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="input-corporate font-serif text-lg"
                      placeholder="Type your full name as signature"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      By typing your name, you agree this constitutes a legal signature
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-accent-600 border-neutral-300 rounded focus:ring-accent-500"
                    />
                    <label htmlFor="agree" className="text-sm text-neutral-700">
                      I have read and agree to the terms of this Non-Disclosure Agreement. 
                      I understand that I am legally bound by this agreement.
                    </label>
                  </div>

                  {error && (
                    <div className="p-3 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowNda(false)}
                      className="btn-ghost flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSignNda}
                      disabled={!visitorName || !visitorEmail || !signature || !agreeToTerms || loading}
                      className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Signing..." : "Sign NDA"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
