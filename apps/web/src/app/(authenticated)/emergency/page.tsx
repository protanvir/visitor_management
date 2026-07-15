"use client";

import { useState } from "react";

const emergencyContacts = [
  { id: "1", name: "Security Control Room", role: "Primary Security", phone: "+1-555-0100", available24x7: true },
  { id: "2", name: "Fire Department", role: "Emergency Services", phone: "911", available24x7: true },
  { id: "3", name: "Medical Emergency", role: "First Aid", phone: "+1-555-0102", available24x7: true },
  { id: "4", name: "Facility Manager", role: "Building Operations", phone: "+1-555-0103", available24x7: false },
];

const emergencyProcedures = [
  { id: "1", title: "Fire Evacuation", type: "fire" as const, steps: ["Alert others nearby", "Use nearest exit", "Proceed to assembly point", "Report to security", "Do not re-enter until authorized"] },
  { id: "2", title: "Medical Emergency", type: "medical" as const, steps: ["Call security immediately", "Do not move the injured person", "Provide basic first aid if trained", "Wait for emergency services"] },
  { id: "3", title: "Security Incident", type: "security" as const, steps: ["Move to a safe location", "Contact security", "Do not confront intruders", "Follow instructions from security team"] },
];

export default function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "procedures">("contacts");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Emergency Information</h1>
        <p className="text-muted">Emergency contacts and procedures for Aptech Group facilities</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("contacts")} className={`btn ${activeTab === "contacts" ? "btn-primary" : "btn-ghost"}`}>
          Emergency Contacts
        </button>
        <button onClick={() => setActiveTab("procedures")} className={`btn ${activeTab === "procedures" ? "btn-primary" : "btn-ghost"}`}>
          Procedures
        </button>
      </div>

      {activeTab === "contacts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyContacts.map((contact) => (
            <div key={contact.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-heading">{contact.name}</h3>
                    <p className="text-sm text-muted">{contact.role}</p>
                  </div>
                  {contact.available24x7 && <span className="badge badge-success">24/7</span>}
                </div>
                <p className="text-lg font-mono font-bold text-heading mt-3">{contact.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "procedures" && (
        <div className="space-y-4">
          {emergencyProcedures.map((proc) => (
            <div key={proc.id} className="card">
              <div className="card-header">
                <h3 className="font-semibold text-heading">{proc.title}</h3>
              </div>
              <div className="card-body">
                <ol className="space-y-2">
                  {proc.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-danger/10 text-danger rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <span className="text-body">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
