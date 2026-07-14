"use client";

import { useEffect, useState } from "react";

interface User { id: string; name: string; email: string; role: string; lastLogin: string | null; createdAt: string; organization: { id: string; name: string }; }
interface PaginatedUsers { data: User[]; total: number; page: number; pageSize: number; totalPages: number; }
const roleBadgeColors: Record<string, string> = { admin: "badge-error", manager: "badge-success", user: "badge-primary" };

export default function UserManagementPage() {
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => { setLoading(true); try { const token = localStorage.getItem("token"); const params = new URLSearchParams({ page: page.toString(), pageSize: "10" }); if (search) params.append("search", search); const res = await fetch(`http://localhost:3001/api/users?${params}`, { headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) setUsers(r.data); else setError(r.error); } catch (e) { setError("Failed"); } finally { setLoading(false); } };
  const handleCreate = async () => { setFormError(""); setFormLoading(true); try { const token = localStorage.getItem("token"); const res = await fetch("http://localhost:3001/api/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) }); const r = await res.json(); if (r.success) { setShowModal(false); setFormData({ name: "", email: "", password: "", role: "user" }); fetchUsers(); } else setFormError(r.error); } catch (e) { setFormError("Failed"); } finally { setFormLoading(false); } };
  const handleUpdate = async () => { if (!editing) return; setFormError(""); setFormLoading(true); try { const token = localStorage.getItem("token"); const body: any = { name: formData.name, email: formData.email, role: formData.role }; if (formData.password) body.password = formData.password; const res = await fetch(`http://localhost:3001/api/users/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }); const r = await res.json(); if (r.success) { setEditing(null); setShowModal(false); setFormData({ name: "", email: "", password: "", role: "user" }); fetchUsers(); } else setFormError(r.error); } catch (e) { setFormError("Failed"); } finally { setFormLoading(false); } };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; try { const token = localStorage.getItem("token"); const res = await fetch(`http://localhost:3001/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }); const r = await res.json(); if (r.success) fetchUsers(); else alert(r.error); } catch (e) { alert("Failed"); } };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-heading">User Management</h1>
        <button onClick={() => { setFormData({ name: "", email: "", password: "", role: "user" }); setShowModal(true); }} className="btn btn-primary">Add User</button>
      </div>
      <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input max-w-md mb-6" />
      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}
      <div className="overflow-x-auto card">
        {loading ? <div className="flex justify-center py-12"><div className="loading w-8 h-8 text-brand"></div></div> : users && users.data.length > 0 ? (
          <table className="table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Last Login</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>{users.data.map((user) => (
              <tr key={user.id}>
                <td><div className="flex items-center gap-3"><div className="avatar w-10 h-10 text-sm">{user.name.charAt(0)}</div><p className="font-medium text-heading">{user.name}</p></div></td>
                <td className="text-muted">{user.email}</td>
                <td><span className={`badge ${roleBadgeColors[user.role] || "badge-primary"}`}>{user.role}</span></td>
                <td className="text-muted">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                <td className="text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button onClick={() => { setEditing(user); setFormData({ name: user.name, email: user.email, password: "", role: user.role }); setShowModal(true); }} className="text-brand hover:underline text-sm font-medium mr-3">Edit</button><button onClick={() => handleDelete(user.id)} className="text-error hover:underline text-sm font-medium">Delete</button></td>
              </tr>
            ))}</tbody>
          </table>
        ) : <div className="text-center py-12 text-muted">No users found</div>}
      </div>
      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditing(null); }}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-heading mb-4">{editing ? "Edit User" : "New User"}</h3>
            {formError && <div className="alert alert-error mb-4"><span>{formError}</span></div>}
            <div className="space-y-4">
              <div><label className="label">Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" /></div>
              <div><label className="label">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" /></div>
              <div><label className="label">Password {editing && "(blank to keep)"}</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" /></div>
              <div><label className="label">Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select"><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="btn btn-ghost">Cancel</button>
              <button onClick={editing ? handleUpdate : handleCreate} disabled={formLoading} className="btn btn-primary">{formLoading ? <span className="loading"></span> : editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
