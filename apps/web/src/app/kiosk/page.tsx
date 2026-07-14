"use client";

import { useState } from "react";

type Step = "welcome" | "details" | "host" | "confirm" | "complete";

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
    name: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    hostId: "",
    hostName: "",
    siteId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const steps: Step[] = ["welcome", "details", "host", "confirm", "complete"];
  const stepLabels = ["Welcome", "Your Info", "Host", "Confirm", "Done"];

  const handleNext = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const visitorResponse = await fetch("http://localhost:3001/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: visitorData.name,
          email: visitorData.email || undefined,
          phone: visitorData.phone || undefined,
          company: visitorData.company || undefined,
        }),
      });

      const visitorResult = await visitorResponse.json();

      if (!visitorResult.success) {
        throw new Error(visitorResult.error || "Failed to create visitor");
      }

      const visitResponse = await fetch("http://localhost:3001/api/visits/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: visitorResult.data.id,
          hostId: visitorData.hostId || "demo-host-id",
          siteId: visitorData.siteId || "demo-site-id",
          purpose: visitorData.purpose,
          visitorType: "guest",
        }),
      });

      const visitResult = await visitResponse.json();

      if (!visitResult.success) {
        throw new Error(visitResult.error || "Failed to check in");
      }

      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kiosk-container">
      <div className="kiosk-card">
        {/* Header with Aptech branding */}
        <div className="bg-primary-900 px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-corporate flex items-center justify-center">
              <span className="text-primary-900 font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Aptech Group</h1>
              <p className="text-xs text-primary-300">Visitor Management</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mt-4">
            {stepLabels.map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step === steps[index]
                      ? "bg-accent-500 text-white scale-110"
                      : index < steps.indexOf(step)
                      ? "bg-success-500 text-white"
                      : "bg-primary-700 text-primary-300"
                  }`}
                >
                  {index < steps.indexOf(step) ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                      index < steps.indexOf(step) ? "bg-success-500" : "bg-primary-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-8">
          {step === "welcome" && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-primary-900 mb-3">Welcome to Aptech Group</h2>
              <p className="text-lg text-neutral-500 mb-8">
                Please check in to begin your visit
              </p>
              <button onClick={handleNext} className="kiosk-btn kiosk-btn-primary">
                Start Check-In
              </button>
            </div>
          )}

          {step === "details" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">Your Information</h2>
              <p className="text-neutral-500 mb-6">Please provide your details</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Full Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorData.name}
                    onChange={(e) => setVisitorData({ ...visitorData, name: e.target.value })}
                    className="input-corporate"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={visitorData.email}
                      onChange={(e) => setVisitorData({ ...visitorData, email: e.target.value })}
                      className="input-corporate"
                      placeholder="you@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={visitorData.phone}
                      onChange={(e) => setVisitorData({ ...visitorData, phone: e.target.value })}
                      className="input-corporate"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={visitorData.company}
                    onChange={(e) => setVisitorData({ ...visitorData, company: e.target.value })}
                    className="input-corporate"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn-ghost">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!visitorData.name}
                  className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === "host" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">Who are you visiting?</h2>
              <p className="text-neutral-500 mb-6">Select the person you're here to meet</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Host Name <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorData.hostName}
                    onChange={(e) => setVisitorData({ ...visitorData, hostName: e.target.value })}
                    className="input-corporate"
                    placeholder="Search for host name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Purpose of Visit
                  </label>
                  <select
                    value={visitorData.purpose}
                    onChange={(e) => setVisitorData({ ...visitorData, purpose: e.target.value })}
                    className="input-corporate"
                  >
                    <option value="">Select purpose</option>
                    <option value="Business Meeting">Business Meeting</option>
                    <option value="Interview">Interview</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Client Visit">Client Visit</option>
                    <option value="Vendor Meeting">Vendor Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn-ghost">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!visitorData.hostName}
                  className="btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-primary-900 mb-2">Confirm Your Details</h2>
              <p className="text-neutral-500 mb-6">Please verify your information</p>
              
              <div className="bg-neutral-50 rounded-corporate-lg p-6 border border-neutral-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</p>
                    <p className="text-sm font-semibold text-primary-900">{visitorData.name}</p>
                  </div>
                  {visitorData.email && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-primary-900">{visitorData.email}</p>
                    </div>
                  )}
                  {visitorData.phone && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-semibold text-primary-900">{visitorData.phone}</p>
                    </div>
                  )}
                  {visitorData.company && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Company</p>
                      <p className="text-sm font-semibold text-primary-900">{visitorData.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Visiting</p>
                    <p className="text-sm font-semibold text-primary-900">{visitorData.hostName}</p>
                  </div>
                  {visitorData.purpose && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Purpose</p>
                      <p className="text-sm font-semibold text-primary-900">{visitorData.purpose}</p>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button onClick={handleBack} className="btn-ghost">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Check-In
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-primary-900 mb-3">Check-In Complete!</h2>
              <p className="text-lg text-neutral-600 mb-2">
                Welcome to Aptech Group, <span className="font-semibold">{visitorData.name}</span>
              </p>
              <p className="text-neutral-500 mb-8">
                {visitorData.hostName} has been notified of your arrival.
              </p>
              <button
                onClick={() => {
                  setStep("welcome");
                  setVisitorData({
                    name: "",
                    email: "",
                    phone: "",
                    company: "",
                    purpose: "",
                    hostId: "",
                    hostName: "",
                    siteId: "",
                  });
                }}
                className="btn-accent"
              >
                Check In Another Visitor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
