"use client";

import { useState } from "react";

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  available24x7: boolean;
}

interface EmergencyProcedure {
  id: string;
  title: string;
  type: "fire" | "medical" | "security";
  steps: string[];
}

const initialContacts: EmergencyContact[] = [
  { id: "1", name: "Security Control Room", role: "Primary Security", phone: "+1-555-0100", available24x7: true },
  { id: "2", name: "Fire Department", role: "Emergency Services", phone: "911", available24x7: true },
  { id: "3", name: "Medical Emergency", role: "First Aid", phone: "+1-555-0102", available24x7: true },
  { id: "4", name: "Facility Manager", role: "Building Operations", phone: "+1-555-0103", available24x7: false },
];

const initialProcedures: EmergencyProcedure[] = [
  { id: "1", title: "Fire Evacuation", type: "fire", steps: ["Alert others nearby", "Use nearest exit", "Proceed to assembly point", "Report to security", "Do not re-enter until authorized"] },
  { id: "2", title: "Medical Emergency", type: "medical", steps: ["Call security immediately", "Do not move the injured person", "Provide basic first aid if trained", "Wait for emergency services"] },
  { id: "3", title: "Security Incident", type: "security", steps: ["Move to a safe location", "Contact security", "Do not confront intruders", "Follow instructions from security team"] },
];

export default function EmergencyPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "procedures">("contacts");
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [procedures, setProcedures] = useState<EmergencyProcedure[]>(initialProcedures);

  const [showContactModal, setShowContactModal] = useState(false);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<EmergencyProcedure | null>(null);

  const [contactForm, setContactForm] = useState({ name: "", role: "", phone: "", available24x7: false });
  const [procedureForm, setProcedureForm] = useState({ title: "", type: "fire" as EmergencyProcedure["type"], steps: "" });

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: "", role: "", phone: "", available24x7: false });
    setShowContactModal(true);
  };

  const openEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, role: contact.role, phone: contact.phone, available24x7: contact.available24x7 });
    setShowContactModal(true);
  };

  const saveContact = () => {
    if (!contactForm.name || !contactForm.phone) return;
    if (editingContact) {
      setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...contactForm } : c));
    } else {
      setContacts([...contacts, { id: Date.now().toString(), ...contactForm }]);
    }
    setShowContactModal(false);
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const openAddProcedure = () => {
    setEditingProcedure(null);
    setProcedureForm({ title: "", type: "fire", steps: "" });
    setShowProcedureModal(true);
  };

  const openEditProcedure = (proc: EmergencyProcedure) => {
    setEditingProcedure(proc);
    setProcedureForm({ title: proc.title, type: proc.type, steps: proc.steps.join("\n") });
    setShowProcedureModal(true);
  };

  const saveProcedure = () => {
    if (!procedureForm.title || !procedureForm.steps) return;
    const steps = procedureForm.steps.split("\n").filter(s => s.trim());
    if (editingProcedure) {
      setProcedures(procedures.map(p => p.id === editingProcedure.id ? { ...p, title: procedureForm.title, type: procedureForm.type, steps } : p));
    } else {
      setProcedures([...procedures, { id: Date.now().toString(), title: procedureForm.title, type: procedureForm.type, steps }]);
    }
    setShowProcedureModal(false);
  };

  const deleteProcedure = (id: string) => {
    setProcedures(procedures.filter(p => p.id !== id));
  };

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
        <>
          <div className="mb-4">
            <button onClick={openAddContact} className="btn btn-primary">+ Add Contact</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
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
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditContact(contact)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={() => deleteContact(contact.id)} className="btn btn-ghost btn-sm text-danger">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "procedures" && (
        <>
          <div className="mb-4">
            <button onClick={openAddProcedure} className="btn btn-primary">+ Add Procedure</button>
          </div>
          <div className="space-y-4">
            {procedures.map((proc) => (
              <div key={proc.id} className="card">
                <div className="card-header flex items-center justify-between">
                  <h3 className="font-semibold text-heading">{proc.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => openEditProcedure(proc)} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={() => deleteProcedure(proc.id)} className="btn btn-ghost btn-sm text-danger">Delete</button>
                  </div>
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
        </>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-heading mb-4">{editingContact ? "Edit Contact" : "Add Contact"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">Name</label>
                <input type="text" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="input w-full" placeholder="Contact name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Role</label>
                <input type="text" value={contactForm.role} onChange={e => setContactForm({ ...contactForm, role: e.target.value })} className="input w-full" placeholder="Role or department" />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Phone</label>
                <input type="text" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className="input w-full" placeholder="Phone number" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="available24x7" checked={contactForm.available24x7} onChange={e => setContactForm({ ...contactForm, available24x7: e.target.checked })} className="checkbox" />
                <label htmlFor="available24x7" className="text-sm text-body">Available 24/7</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowContactModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={saveContact} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      {showProcedureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-heading mb-4">{editingProcedure ? "Edit Procedure" : "Add Procedure"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-body mb-1">Title</label>
                <input type="text" value={procedureForm.title} onChange={e => setProcedureForm({ ...procedureForm, title: e.target.value })} className="input w-full" placeholder="Procedure title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Type</label>
                <select value={procedureForm.type} onChange={e => setProcedureForm({ ...procedureForm, type: e.target.value as EmergencyProcedure["type"] })} className="input w-full">
                  <option value="fire">Fire</option>
                  <option value="medical">Medical</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-body mb-1">Steps (one per line)</label>
                <textarea value={procedureForm.steps} onChange={e => setProcedureForm({ ...procedureForm, steps: e.target.value })} className="input w-full h-32" placeholder="Step 1&#10;Step 2&#10;Step 3" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowProcedureModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={saveProcedure} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
