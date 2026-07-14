"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: string;
  phone: string | null;
  siteId: string | null;
  site?: { id: string; name: string } | null;
  _count?: { hostedVisits: number };
}

interface Site {
  id: string;
  name: string;
}

interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const roleBadgeColors: Record<string, string> = {
  admin: "badge badge-error",
  receptionist: "badge badge-accent",
  security: "badge badge-warning",
  employee: "badge badge-primary",
};

export default function EmployeesManagementPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<PaginatedEmployees | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "", email: "", department: "", role: "employee", phone: "", siteId: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchSites(); }, []);
  useEffect(() => { fetchEmployees(); }, [page, search]);

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/sites", { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setSites(result.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: page.toString(), pageSize: "10" });
      if (search) params.append("search", search);
      const res = await fetch(`http://localhost:3001/api/employees?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setEmployees(result.data);
      else setError(result.error);
    } catch (err) { setError("Failed to connect to server"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setFormError(""); setFormLoading(true);
    try {
      if (!user?.organizationId) { setFormError("No organization associated"); setFormLoading(false); return; }
      const token = localStorage.getItem("token");
      const body: any = { name: formData.name, email: formData.email, role: formData.role, organizationId: user.organizationId };
      if (formData.department) body.department = formData.department;
      if (formData.phone) body.phone = formData.phone;
      if (formData.siteId) body.siteId = formData.siteId;
      const res = await fetch("http://localhost:3001/api/employees", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setShowCreateModal(false); resetForm(); fetchEmployees(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;
    setFormError(""); setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body: any = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.department) body.department = formData.department;
      if (formData.phone) body.phone = formData.phone;
      if (formData.siteId) body.siteId = formData.siteId;
      const res = await fetch(`http://localhost:3001/api/employees/${editingEmployee.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setEditingEmployee(null); resetForm(); fetchEmployees(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/employees/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) fetchEmployees(); else alert(result.error);
    } catch (err) { alert("Failed to delete"); }
  };

  const resetForm = () => setFormData({ name: "", email: "", department: "", role: "employee", phone: "", siteId: "" });

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ name: emp.name, email: emp.email, department: emp.department || "", role: emp.role, phone: emp.phone || "", siteId: emp.siteId || "" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn btn-primary">Add Employee</button>
      </div>

      <input type="text" placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input input-bordered w-full max-w-md mb-6" />

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-xl">
        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : employees && employees.data.length > 0 ? (
          <table className="table table-zebra">
            <thead><tr><th>Employee</th><th>Email</th><th>Department</th><th>Site</th><th>Role</th><th>Visits</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.data.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder"><div className="bg-primary text-primary-content w-10 h-10 rounded-full"><span>{emp.name.charAt(0)}</span></div></div>
                      <div><p className="font-bold">{emp.name}</p>{emp.phone && <p className="text-xs text-base-content/60">{emp.phone}</p>}</div>
                    </div>
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.department || "—"}</td>
                  <td>{emp.site?.name || "—"}</td>
                  <td><span className={`badge ${roleBadgeColors[emp.role] || "badge-primary"}`}>{emp.role}</span></td>
                  <td>{emp._count?.hostedVisits || 0}</td>
                  <td>
                    <button onClick={() => openEditModal(emp)} className="btn btn-ghost btn-xs">Edit</button>
                    <button onClick={() => handleDelete(emp.id)} className="btn btn-error btn-xs ml-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-base-content/60">No employees found</div>
        )}
      </div>

      {(showCreateModal || editingEmployee) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{editingEmployee ? "Edit Employee" : "New Employee"}</h3>
            {formError && <div className="alert alert-error mt-4"><span>{formError}</span></div>}
            <div className="py-4 space-y-4">
              <div className="form-control"><label className="label"><span className="label-text">Name *</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Email *</span></label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input input-bordered" disabled={!!editingEmployee} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control"><label className="label"><span className="label-text">Department</span></label><input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="input input-bordered" /></div>
                <div className="form-control"><label className="label"><span className="label-text">Phone</span></label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input input-bordered" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control"><label className="label"><span className="label-text">Role</span></label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select select-bordered">
                    <option value="employee">Employee</option><option value="receptionist">Receptionist</option><option value="security">Security</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-control"><label className="label"><span className="label-text">Site</span></label>
                  <select value={formData.siteId} onChange={(e) => setFormData({ ...formData, siteId: e.target.value })} className="select select-bordered">
                    <option value="">Select site</option>{sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => { setShowCreateModal(false); setEditingEmployee(null); }} className="btn">Cancel</button>
              <button onClick={editingEmployee ? handleUpdate : handleCreate} disabled={formLoading || !formData.name || !formData.email} className="btn btn-primary">
                {formLoading ? <span className="loading loading-spinner loading-sm"></span> : editingEmployee ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
      )}
    </div>
  );
}
