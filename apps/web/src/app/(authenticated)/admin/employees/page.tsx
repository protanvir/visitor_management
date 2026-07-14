"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Employee { id: string; name: string; email: string; designation: string | null; department: string | null; role: string; phone: string | null; siteId: string | null; site?: { id: string; name: string } | null; _count?: { hostedVisits: number }; }
interface Site { id: string; name: string; }
interface PaginatedEmployees { data: Employee[]; total: number; page: number; pageSize: number; totalPages: number; }

const roleBadgeColors: Record<string, string> = { admin: "badge-error", receptionist: "badge-warning", security: "badge-success", employee: "badge-primary" };

export default function EmployeesManagementPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<PaginatedEmployees | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", designation: "", department: "", role: "employee", phone: "", siteId: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchSites(); }, []);
  useEffect(() => { fetchEmployees(); }, [page, search]);

  const fetchSites = async () => { try { const token = localStorage.getItem("token"); const res = await fetch("http://localhost:3001/api/sites", { headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) setSites(r.data || []); } catch (e) { console.error(e); } };
  const fetchEmployees = async () => { setLoading(true); try { const token = localStorage.getItem("token"); const params = new URLSearchParams({ page: page.toString(), pageSize: "10" }); if (search) params.append("search", search); const res = await fetch(`http://localhost:3001/api/employees?${params}`, { headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) setEmployees(r.data); else setError(r.error); } catch (e) { setError("Failed to connect"); } finally { setLoading(false); } };
  const resetForm = () => setFormData({ name: "", email: "", designation: "", department: "", role: "employee", phone: "", siteId: "" });
  const handleCreate = async () => { setFormError(""); setFormLoading(true); try { if (!user?.organizationId) { setFormError("No organization"); setFormLoading(false); return; } const token = localStorage.getItem("token"); const res = await fetch("http://localhost:3001/api/employees", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...formData, organizationId: user.organizationId }) }); const r = await res.json(); if (r.success) { setShowModal(false); resetForm(); fetchEmployees(); } else setFormError(r.error); } catch (e) { setFormError("Failed to connect"); } finally { setFormLoading(false); } };
  const handleUpdate = async () => { if (!editing) return; setFormError(""); setFormLoading(true); try { const token = localStorage.getItem("token"); const res = await fetch(`http://localhost:3001/api/employees/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) }); const r = await res.json(); if (r.success) { setEditing(null); setShowModal(false); resetForm(); fetchEmployees(); } else setFormError(r.error); } catch (e) { setFormError("Failed to connect"); } finally { setFormLoading(false); } };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; try { const token = localStorage.getItem("token"); const res = await fetch(`http://localhost:3001/api/employees/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) fetchEmployees(); else alert(r.error); } catch (e) { alert("Failed"); } };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heading">Employees</h1>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">Add Employee</button>
      </div>
      <input type="text" placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-md mb-6" />
      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}
      <div className="overflow-x-auto card">
        {loading ? <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div> : employees && employees.data.length > 0 ? (
          <table className="table">
            <thead><tr><th>Employee</th><th>Email</th><th>Designation</th><th>Dept</th><th>Site</th><th>Role</th><th>Visits</th><th>Actions</th></tr></thead>
            <tbody>{employees.data.map((emp) => (
              <tr key={emp.id}>
                <td><div className="flex items-center gap-3"><div className="avatar w-10 h-10 text-sm">{emp.name.charAt(0)}</div><div><p className="font-medium text-heading">{emp.name}</p>{emp.phone && <p className="text-xs text-muted">{emp.phone}</p>}</div></div></td>
                <td className="text-muted">{emp.email}</td>
                <td className="text-muted">{emp.designation || "—"}</td>
                <td className="text-muted">{emp.department || "—"}</td>
                <td className="text-muted">{emp.site?.name || "—"}</td>
                <td><span className={`badge ${roleBadgeColors[emp.role] || "badge-primary"}`}>{emp.role}</span></td>
                <td className="text-muted">{emp._count?.hostedVisits || 0}</td>
                <td><button onClick={() => { setEditing(emp); setFormData({ name: emp.name, email: emp.email, designation: emp.designation || "", department: emp.department || "", role: emp.role, phone: emp.phone || "", siteId: emp.siteId || "" }); setShowModal(true); }} className="text-brand hover:underline text-sm font-medium mr-3">Edit</button><button onClick={() => handleDelete(emp.id)} className="text-error hover:underline text-sm font-medium">Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <div className="text-center py-12 text-muted">No employees found</div>}
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">{editing ? "Edit Employee" : "New Employee"}</h3>
            {formError && <div className="alert alert-error mb-4"><span>{formError}</span></div>}
            <div className="space-y-4">
              <div><label className="label">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
              <div><label className="label">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" disabled={!!editing} /></div>
              <div><label className="label">Designation</label><input type="text" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="input" placeholder="e.g., Manager, Engineer, Director" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Department</label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input" /></div>
                <div><label className="label">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select"><option value="employee">Employee</option><option value="receptionist">Receptionist</option><option value="security">Security</option><option value="admin">Admin</option></select></div>
                <div><label className="label">Site</label><select value={formData.siteId} onChange={(e) => setFormData({ ...formData, siteId: e.target.value })} className="select"><option value="">Select site</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="btn btn-ghost">Cancel</button>
              <button onClick={editing ? handleUpdate : handleCreate} disabled={formLoading || !formData.name || !formData.email} className="btn btn-primary">{formLoading ? <span className="loading"></span> : editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
