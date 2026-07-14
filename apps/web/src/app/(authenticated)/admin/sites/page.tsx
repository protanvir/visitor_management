"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Site {
  id: string;
  name: string;
  address: string | null;
  timezone: string;
  _count?: { employees: number; visits: number };
}

export default function SitesManagementPage() {
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", timezone: "UTC" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchSites(); }, [search]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`http://localhost:3001/api/sites?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setSites(result.data || []);
      else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setFormError(""); setFormLoading(true);
    try {
      if (!user?.organizationId) { setFormError("No organization associated"); setFormLoading(false); return; }
      const token = localStorage.getItem("token");
      const body: any = { name: formData.name, organizationId: user.organizationId };
      if (formData.address) body.address = formData.address;
      if (formData.timezone) body.timezone = formData.timezone;
      const res = await fetch("http://localhost:3001/api/sites", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setShowCreateModal(false); setFormData({ name: "", address: "", timezone: "UTC" }); fetchSites(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingSite) return;
    setFormError(""); setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/sites/${editingSite.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (result.success) { setEditingSite(null); setFormData({ name: "", address: "", timezone: "UTC" }); fetchSites(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this site?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/sites/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) fetchSites(); else alert(result.error);
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sites</h1>
        <button onClick={() => { setFormData({ name: "", address: "", timezone: "UTC" }); setShowCreateModal(true); }} className="btn btn-primary">Add Site</button>
      </div>

      <input type="text" placeholder="Search sites..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-bordered w-full max-w-md mb-6" />

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-xl">
        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : sites.length > 0 ? (
          <table className="table table-zebra">
            <thead><tr><th>Site Name</th><th>Address</th><th>Timezone</th><th>Employees</th><th>Visits</th><th>Actions</th></tr></thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td className="font-bold">{site.name}</td>
                  <td>{site.address || "—"}</td>
                  <td>{site.timezone}</td>
                  <td>{site._count?.employees || 0}</td>
                  <td>{site._count?.visits || 0}</td>
                  <td>
                    <button onClick={() => { setEditingSite(site); setFormData({ name: site.name, address: site.address || "", timezone: site.timezone }); }} className="btn btn-ghost btn-xs">Edit</button>
                    <button onClick={() => handleDelete(site.id)} className="btn btn-error btn-xs ml-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-base-content/60">No sites found</div>
        )}
      </div>

      {(showCreateModal || editingSite) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{editingSite ? "Edit Site" : "New Site"}</h3>
            {formError && <div className="alert alert-error mt-4"><span>{formError}</span></div>}
            <div className="py-4 space-y-4">
              <div className="form-control"><label className="label"><span className="label-text">Site Name *</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input input-bordered" placeholder="Main Office" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Address</span></label><input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input input-bordered" placeholder="123 Main St" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Timezone</span></label>
                <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="select select-bordered">
                  <option value="UTC">UTC</option><option value="America/New_York">Eastern</option><option value="America/Chicago">Central</option><option value="America/Los_Angeles">Pacific</option><option value="Europe/London">London</option><option value="Asia/Dubai">Dubai</option>
                </select>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => { setShowCreateModal(false); setEditingSite(null); }} className="btn">Cancel</button>
              <button onClick={editingSite ? handleUpdate : handleCreate} disabled={formLoading || !formData.name} className="btn btn-primary">
                {formLoading ? <span className="loading loading-spinner loading-sm"></span> : editingSite ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
      )}
    </div>
  );
}
