"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="loading w-8 h-8 text-brand"></div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand text-white flex items-center justify-center mx-auto mb-4 rounded-xl font-bold text-2xl">
            V
          </div>
          <h1 className="text-3xl font-bold text-heading">VMS</h1>
          <p className="text-muted">Visitor Management System</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-heading mb-6">Sign In</h2>
          {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Enter your password" required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <span className="loading"></span> : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-6 p-4 bg-neutral-100 rounded-lg text-center">
          <p className="text-sm font-medium text-heading">Demo Credentials:</p>
          <p className="text-xs text-muted mt-1">Email: admin@aptechgroup.com | Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
