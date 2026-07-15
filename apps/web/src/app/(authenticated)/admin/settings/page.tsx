"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await res.json();
      if (result.success) { setMessage("Password changed successfully"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
      else setError(result.error);
    } catch (err) { setError("Failed to connect"); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-heading">Settings</h1>
        <p className="text-muted">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body border-b border-neutral-100">
            <h3 className="font-bold text-heading">Profile Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center gap-4">
              <div className="avatar w-16 h-16 text-xl">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-lg font-semibold text-heading">{user?.name}</p>
                <p className="text-muted">{user?.email}</p>
                <span className="badge badge-primary mt-1">{user?.role}</span>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-4 grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted">Organization</p><p className="font-medium text-heading">{user?.organization?.name || "N/A"}</p></div>
              <div><p className="text-muted">Account Created</p><p className="font-medium text-heading">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body border-b border-neutral-100">
            <h3 className="font-bold text-heading">Change Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {message && <div className="alert alert-success"><span>{message}</span></div>}
              {error && <div className="alert alert-error"><span>{error}</span></div>}
              <div><label className="label">Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input" required /></div>
              <div><label className="label">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="Min 6 characters" required /></div>
              <div><label className="label">Confirm Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" required /></div>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Changing..." : "Change Password"}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
