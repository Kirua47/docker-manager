"use client";

import { useState } from "react";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        window.location.href = "/dashboard";
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Unable to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden font-body-md">
      {/* Background Decorative Elements using theme colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/5 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative w-full max-w-[420px] p-lg animate-in zoom-in-95 duration-500">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-xl shadow-surface-container-low/50">
          <div className="flex flex-col items-center mb-xl">
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-md shadow-[0_4px_20px_rgba(0,98,161,0.15)]">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight">Access Control</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-sm text-center">Secure Gateway for Personal Orchestrator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {error && (
              <div className="bg-error-container border border-error text-error text-xs py-sm px-md rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-xs">
              <label className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-medium">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="admin" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-on-surface font-body-md focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/70"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-medium">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 pl-12 pr-4 text-on-surface font-body-md focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/70"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-on-primary font-semibold py-3 px-md rounded-xl flex items-center justify-center gap-xs transition-all shadow-[0_4px_12px_rgba(0,98,161,0.2)] active:scale-95 disabled:opacity-50 disabled:scale-100 font-title-sm text-title-sm mt-lg cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant/30 text-center">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold opacity-60">
              Authorized access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
