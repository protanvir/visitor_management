"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Site { id: string; name: string; address: string | null; timezone: string; _count?: { employees: number; visits: number }; }

export default function SitesManagementPage() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", timezone: "UTC" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchSites(); }, [search]);

  const fetchSites = async () => { setLoading(true); try { const token = localStorage.getItem("token"); const params = new URLSearchParams(); if (search) params.append("search", search); const res = await fetch(`/api/sites?${params}`, { headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) setSites(r.data || []); else setError(r.error); } catch (e) { setError("Failed"); } finally { setLoading(false); } };
  const handleCreate = async () => { setFormError(""); setFormLoading(true); try { if (!user?.organizationId) { setFormError("No org"); setFormLoading(false); return; } const token = localStorage.getItem("token"); const res = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...formData, organizationId: user.organizationId }) }); const r = await res.json(); if (r.success) { setShowModal(false); setFormData({ name: "", address: "", timezone: "UTC" }); fetchSites(); } else setFormError(r.error); } catch (e) { setFormError("Failed"); } finally { setFormLoading(false); } };
  const handleUpdate = async () => { if (!editing) return; setFormError(""); setFormLoading(true); try { const token = localStorage.getItem("token"); const res = await fetch(`/api/sites/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) }); const r = await res.json(); if (r.success) { setEditing(null); setShowModal(false); setFormData({ name: "", address: "", timezone: "UTC" }); fetchSites(); } else setFormError(r.error); } catch (e) { setFormError("Failed"); } finally { setFormLoading(false); } };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; try { const token = localStorage.getItem("token"); const res = await fetch(`/api/sites/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) fetchSites(); else alert(r.error); } catch (e) { alert("Failed"); } };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heading">Sites</h1>
        <button onClick={() => { setFormData({ name: "", address: "", timezone: "UTC" }); setShowModal(true); }} className="btn btn-primary">Add Site</button>
      </div>
      <input type="text" placeholder="Search sites..." value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-md mb-6" />
      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}
      <div className="overflow-x-auto card">
        {loading ? <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div> : sites.length > 0 ? (
          <table className="table">
            <thead><tr><th>Site Name</th><th>Address</th><th>Timezone</th><th>Employees</th><th>Visits</th><th>Actions</th></tr></thead>
            <tbody>{sites.map((site) => (
              <tr key={site.id}>
                <td className="font-medium text-heading">{site.name}</td>
                <td className="text-muted">{site.address || "—"}</td>
                <td className="text-muted">{site.timezone}</td>
                <td className="text-muted">{site._count?.employees || 0}</td>
                <td className="text-muted">{site._count?.visits || 0}</td>
                <td><button onClick={() => { setEditing(site); setFormData({ name: site.name, address: site.address || "", timezone: site.timezone }); setShowModal(true); }} className="text-brand hover:underline text-sm font-medium mr-3">Edit</button><button onClick={() => handleDelete(site.id)} className="text-error hover:underline text-sm font-medium">Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <div className="text-center py-12 text-muted">No sites found</div>}
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">{editing ? "Edit Site" : "New Site"}</h3>
            {formError && <div className="alert alert-error mb-4"><span>{formError}</span></div>}
            <div className="space-y-4">
              <div><label className="label">Site Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="Main Office" /></div>
              <div><label className="label">Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" placeholder="123 Main St" /></div>
              <div><label className="label">Timezone</label><select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="select"><option value="UTC">UTC</option><option value="America/New_York">Eastern</option><option value="America/Chicago">Central</option><option value="America/Los_Angeles">Pacific</option><option value="Europe/London">London</option><option value="Asia/Dubai">Dubai</option></select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="btn btn-ghost">Cancel</button>
              <button onClick={editing ? handleUpdate : handleCreate} disabled={formLoading || !formData.name} className="btn btn-primary">{formLoading ? <span className="loading"></span> : editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
