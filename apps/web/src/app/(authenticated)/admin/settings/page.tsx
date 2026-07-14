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
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3001/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="page-title">Settings</h2>
        <p className="page-subtitle">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="card-corporate">
          <div className="card-corporate-header">
            <h3 className="text-lg font-semibold text-primary-900">Profile Information</h3>
          </div>
          <div className="card-corporate-body space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="avatar avatar-xl bg-primary-100 text-primary-700">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-lg font-semibold text-primary-900">{user?.name}</p>
                <p className="text-neutral-500">{user?.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Organization</p>
                  <p className="font-medium text-primary-900">{user?.organization?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Account Created</p>
                  <p className="font-medium text-primary-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card-corporate">
          <div className="card-corporate-header">
            <h3 className="text-lg font-semibold text-primary-900">Change Password</h3>
          </div>
          <div className="card-corporate-body">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {message && <div className="p-3 bg-success-50 border border-success-200 rounded-corporate text-success-700 text-sm">{message}</div>}
              {error && <div className="p-3 bg-danger-50 border border-danger-200 rounded-corporate text-danger-700 text-sm">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-corporate" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-corporate" placeholder="Minimum 6 characters" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-corporate" required />
              </div>
              <button type="submit" disabled={loading} className="btn-accent disabled:opacity-50">
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
