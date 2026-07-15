"use client";

import { useEffect, useState } from "react";

interface VisitorType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function VisitorTypesPage() {
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<VisitorType | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#3B82F6", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVisitorTypes(); }, []);

  const fetchVisitorTypes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/visitor-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) setVisitorTypes(result.data);
      else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingType
        ? `/api/visitor-types/${editingType.id}`
        : "/api/visitor-types";
      const method = editingType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          organizationId: "org-1", // Default org - in production get from auth context
        }),
      });
      const result = await res.json();
      if (result.success) {
        fetchVisitorTypes();
        resetForm();
      } else {
        setError(result.error);
      }
    } catch (err) { setError("Failed to save"); }
    finally { setSaving(false); }
  };

  const handleEdit = (vt: VisitorType) => {
    setEditingType(vt);
    setFormData({
      name: vt.name,
      description: vt.description || "",
      color: vt.color || "#3B82F6",
      sortOrder: vt.sortOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this visitor type?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/visitor-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) fetchVisitorTypes();
      else setError(result.error);
    } catch (err) { setError("Failed to delete"); }
  };

  const handleToggle = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/visitor-types/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) fetchVisitorTypes();
      else setError(result.error);
    } catch (err) { setError("Failed to toggle"); }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#3B82F6", sortOrder: 0 });
    setEditingType(null);
    setShowForm(false);
  };

  const predefinedTypes = [
    { name: "Buyer", description: "Purchasing representatives", color: "#3B82F6" },
    { name: "Supplier", description: "Vendor or supplier personnel", color: "#10B981" },
    { name: "Auditor", description: "External auditors", color: "#8B5CF6" },
    { name: "Bank", description: "Bank representatives", color: "#F59E0B" },
    { name: "Contractor", description: "Service contractors", color: "#EF4444" },
    { name: "Delivery", description: "Delivery personnel", color: "#6366F1" },
    { name: "Interview", description: "Job interview candidates", color: "#EC4899" },
    { name: "Client", description: "Client representatives", color: "#14B8A6" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">Visitor Types</h1>
          <p className="text-muted">Manage custom visitor categories for your organization</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Visitor Type
        </button>
      </div>

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      {/* Quick Add Presets */}
      <div className="card mb-6">
        <div className="card-header">
          <h3 className="font-semibold text-heading">Quick Add Presets</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-wrap gap-2">
            {predefinedTypes.map((preset) => {
              const exists = visitorTypes.some(vt => vt.name === preset.name);
              return (
                <button
                  key={preset.name}
                  disabled={exists}
                  onClick={() => {
                    setFormData({ name: preset.name, description: preset.description, color: preset.color, sortOrder: visitorTypes.length });
                    setShowForm(true);
                  }}
                  className={`btn btn-sm ${exists ? "btn-ghost opacity-50" : "btn-ghost"}`}
                  style={!exists ? { borderColor: preset.color, color: preset.color } : {}}
                >
                  {exists ? "✓ " : "+ "}{preset.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visitor Types List */}
      <div className="overflow-x-auto card">
        {loading ? (
          <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div>
        ) : visitorTypes.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitorTypes.map((vt) => (
                <tr key={vt.id}>
                  <td>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: vt.color || "#3B82F6" }}></div>
                  </td>
                  <td className="font-medium text-heading">{vt.name}</td>
                  <td className="text-muted">{vt.description || "—"}</td>
                  <td>
                    <span className={`badge ${vt.active ? "badge-success" : "badge-neutral"}`}>
                      {vt.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-muted">{vt.sortOrder}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(vt)} className="text-brand hover:underline text-sm font-medium">Edit</button>
                      <button onClick={() => handleToggle(vt.id)} className="text-muted hover:underline text-sm font-medium">
                        {vt.active ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleDelete(vt.id)} className="text-danger hover:underline text-sm font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted">No visitor types configured. Add one to get started.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md mx-4">
            <div className="card-header">
              <h3 className="font-semibold text-heading">{editingType ? "Edit Visitor Type" : "Add Visitor Type"}</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Buyer, Supplier, Auditor"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="card-footer flex justify-end gap-2">
              <button onClick={resetForm} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSubmit} disabled={!formData.name.trim() || saving} className="btn btn-primary">
                {saving ? "Saving..." : editingType ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
