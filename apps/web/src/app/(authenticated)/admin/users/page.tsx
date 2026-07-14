"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
  organization: { id: string; name: string };
}

interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const roleBadgeColors: Record<string, string> = {
  admin: "badge badge-error",
  manager: "badge badge-success",
  user: "badge badge-primary",
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: page.toString(), pageSize: "10" });
      if (search) params.append("search", search);
      const res = await fetch(`http://localhost:3001/api/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) setUsers(result.data); else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setFormError(""); setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/api/users", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formData) });
      const result = await res.json();
      if (result.success) { setShowCreateModal(false); setFormData({ name: "", email: "", password: "", role: "user" }); fetchUsers(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setFormError(""); setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body: any = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) body.password = formData.password;
      const res = await fetch(`http://localhost:3001/api/users/${editingUser.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
      const result = await res.json();
      if (result.success) { setEditingUser(null); setFormData({ name: "", email: "", password: "", role: "user" }); fetchUsers(); }
      else setFormError(result.error);
    } catch (err) { setFormError("Failed to connect"); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/api/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const result = await res.json();
      if (result.success) fetchUsers(); else alert(result.error);
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button onClick={() => { setFormData({ name: "", email: "", password: "", role: "user" }); setShowCreateModal(true); }} className="btn btn-primary">Add User</button>
      </div>

      <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input input-bordered w-full max-w-md mb-6" />

      {error && <div className="alert alert-error mb-6"><span>{error}</span></div>}

      <div className="overflow-x-auto bg-base-100 border border-base-300 rounded-xl">
        {loading ? (
          <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : users && users.data.length > 0 ? (
          <table className="table table-zebra">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Last Login</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {users.data.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder"><div className="bg-primary text-primary-content w-10 h-10 rounded-full"><span>{user.name.charAt(0)}</span></div></div>
                      <p className="font-bold">{user.name}</p>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`badge ${roleBadgeColors[user.role] || "badge-primary"}`}>{user.role}</span></td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => { setEditingUser(user); setFormData({ name: user.name, email: user.email, password: "", role: user.role }); }} className="btn btn-ghost btn-xs">Edit</button>
                    <button onClick={() => handleDelete(user.id)} className="btn btn-error btn-xs ml-1">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-base-content/60">No users found</div>
        )}
      </div>

      {(showCreateModal || editingUser) && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{editingUser ? "Edit User" : "New User"}</h3>
            {formError && <div className="alert alert-error mt-4"><span>{formError}</span></div>}
            <div className="py-4 space-y-4">
              <div className="form-control"><label className="label"><span className="label-text">Name *</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Email *</span></label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Password {editingUser && "(leave blank to keep)"}</span></label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input input-bordered" /></div>
              <div className="form-control"><label className="label"><span className="label-text">Role</span></label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select select-bordered">
                  <option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={() => { setShowCreateModal(false); setEditingUser(null); }} className="btn">Cancel</button>
              <button onClick={editingUser ? handleUpdate : handleCreate} disabled={formLoading} className="btn btn-primary">
                {formLoading ? <span className="loading loading-spinner loading-sm"></span> : editingUser ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
      )}
    </div>
  );
}
