"use client";

import { useState } from "react";

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  available24x7: boolean;
}

interface EmergencyProcedure {
  id: string;
  title: string;
  type: "fire" | "medical" | "security" | "evacuation" | "weather";
  steps: string[];
  contacts: string[];
}

export default function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "procedures" | "alert">("contacts");

  // Emergency contacts data
  const emergencyContacts: EmergencyContact[] = [
    {
      id: "1",
      name: "Security Control Room",
      role: "Primary Security",
      phone: "+8801712345682",
      email: "security@aptechgroup.com",
      available24x7: true,
    },
    {
      id: "2",
      name: "Fire Department",
      role: "Emergency Services",
      phone: "999",
      available24x7: true,
    },
    {
      id: "3",
      name: "Ambulance Services",
      role: "Medical Emergency",
      phone: "999",
      available24x7: true,
    },
    {
      id: "4",
      name: "Abdul Rahman",
      role: "Factory Manager",
      phone: "+8801712345678",
      email: "rahman@aptechgroup.com",
      available24x7: false,
    },
    {
      id: "5",
      name: "First Aid Station",
      role: "Medical Support",
      phone: "+8801712345683",
      available24x7: true,
    },
  ];

  // Emergency procedures
  const emergencyProcedures: EmergencyProcedure[] = [
    {
      id: "1",
      title: "Fire Emergency",
      type: "fire",
      steps: [
        "Alert others nearby and activate the nearest fire alarm",
        "Call Security Control Room immediately",
        "Evacuate the building using the nearest safe exit",
        "Do NOT use elevators",
        "Proceed to the designated assembly point",
        "Report to your floor warden for headcount",
        "Do not re-enter until authorized by emergency services",
      ],
      contacts: ["Security Control Room", "Fire Department"],
    },
    {
      id: "2",
      title: "Medical Emergency",
      type: "medical",
      steps: [
        "Ensure the scene is safe before approaching",
        "Call for First Aid Station immediately",
        "Do not move the injured person unless in immediate danger",
        "Administer first aid if trained",
        "Call ambulance services if serious",
        "Stay with the person until help arrives",
        "Report the incident to Security",
      ],
      contacts: ["First Aid Station", "Ambulance Services"],
    },
    {
      id: "3",
      title: "Security Threat",
      type: "security",
      steps: [
        "Stay calm and do not attract attention",
        "Move to a safe location if possible",
        "Call Security Control Room immediately",
        "Follow instructions from security personnel",
        "Do not attempt to confront the threat",
        "Evacuate if instructed to do so",
        "Report any suspicious activity",
      ],
      contacts: ["Security Control Room"],
    },
    {
      id: "4",
      title: "General Evacuation",
      type: "evacuation",
      steps: [
        "Stop all work immediately",
        "Secure any hazardous materials if safe to do so",
        "Close doors behind you (do not lock)",
        "Proceed to the nearest emergency exit",
        "Use stairs only - never elevators",
        "Gather at the designated assembly point",
        "Wait for instructions from floor wardens",
      ],
      contacts: ["Security Control Room", "Floor Wardens"],
    },
    {
      id: "5",
      title: "Severe Weather",
      type: "weather",
      steps: [
        "Move away from windows and glass surfaces",
        "Proceed to designated shelter areas",
        "Monitor official weather updates",
        "Follow instructions from management",
        "Stay indoors until all-clear is given",
        "Report any building damage to Security",
      ],
      contacts: ["Security Control Room", "Facilities Management"],
    },
  ];

  const getProcedureIcon = (type: string) => {
    switch (type) {
      case "fire":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case "medical":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case "security":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case "evacuation":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case "weather":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getProcedureColor = (type: string) => {
    switch (type) {
      case "fire": return "bg-danger-100 text-danger-600";
      case "medical": return "bg-success-100 text-success-600";
      case "security": return "bg-warning-100 text-warning-600";
      case "evacuation": return "bg-accent-100 text-accent-600";
      case "weather": return "bg-neutral-100 text-neutral-600";
      default: return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-danger-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-corporate flex items-center justify-center">
                <span className="text-danger-600 font-bold text-sm">!</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Emergency Information</h1>
                <p className="text-xs text-danger-200">Aptech Group</p>
              </div>
            </div>
            <a href="/" className="text-white hover:text-danger-200 text-sm font-medium">
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Emergency Banner */}
      <div className="bg-danger-700 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-center">
              <p className="font-bold text-lg">IN CASE OF EMERGENCY</p>
              <p className="text-danger-200">Call Security: +8801712345682 | Emergency: 999</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2.5 rounded-corporate font-medium transition-all ${
              activeTab === "contacts"
                ? "bg-danger-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            Emergency Contacts
          </button>
          <button
            onClick={() => setActiveTab("procedures")}
            className={`px-4 py-2.5 rounded-corporate font-medium transition-all ${
              activeTab === "procedures"
                ? "bg-danger-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            Procedures
          </button>
          <button
            onClick={() => setActiveTab("alert")}
            className={`px-4 py-2.5 rounded-corporate font-medium transition-all ${
              activeTab === "alert"
                ? "bg-danger-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            Send Alert
          </button>
        </div>

        {/* Emergency Contacts */}
        {activeTab === "contacts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact) => (
              <div key={contact.id} className="card-corporate">
                <div className="card-corporate-body">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-primary-900">{contact.name}</h3>
                      <p className="text-sm text-neutral-500">{contact.role}</p>
                    </div>
                    {contact.available24x7 && (
                      <span className="badge badge-success text-xs">24/7</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-2 text-accent-600 hover:text-accent-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {contact.phone}
                    </a>
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Procedures */}
        {activeTab === "procedures" && (
          <div className="space-y-4">
            {emergencyProcedures.map((procedure) => (
              <div key={procedure.id} className="card-corporate">
                <div className="card-corporate-header">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-corporate flex items-center justify-center ${getProcedureColor(procedure.type)}`}>
                      {getProcedureIcon(procedure.type)}
                    </div>
                    <h3 className="text-lg font-semibold text-primary-900">{procedure.title}</h3>
                  </div>
                </div>
                <div className="card-corporate-body">
                  <ol className="space-y-2">
                    {procedure.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-neutral-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <p className="text-sm text-neutral-500">
                      <strong>Contacts:</strong> {procedure.contacts.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send Alert */}
        {activeTab === "alert" && (
          <div className="card-corporate max-w-2xl">
            <div className="card-corporate-header bg-danger-50">
              <h3 className="text-lg font-semibold text-danger-700">Send Emergency Alert</h3>
              <p className="text-sm text-danger-600">This will send an alert to all on-site visitors and staff</p>
            </div>
            <div className="card-corporate-body">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Alert Type
                  </label>
                  <select className="input-corporate">
                    <option value="">Select alert type</option>
                    <option value="fire">Fire Emergency</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="security">Security Threat</option>
                    <option value="evacuation">General Evacuation</option>
                    <option value="weather">Severe Weather</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    className="input-corporate"
                    rows={4}
                    placeholder="Enter emergency message..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Site
                  </label>
                  <select className="input-corporate">
                    <option value="">All Sites</option>
                    <option value="main-office">Main Office</option>
                    <option value="factory">Factory</option>
                  </select>
                </div>
                <button className="btn-danger w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Send Emergency Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
