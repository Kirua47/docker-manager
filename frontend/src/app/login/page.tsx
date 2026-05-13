"use client";

import { useState } from "react";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Future login logic
    setTimeout(() => (window.location.href = "/dashboard"), 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/20 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative w-full max-w-md p-8 animate-in zoom-in-95 duration-500">
        <div className="glass rounded-3xl p-8 shadow-2xl border-white/10 backdrop-blur-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
              <ShieldCheck className="w-8 h-8 text-accent-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Access Control</h1>
            <p className="text-zinc-500 mt-2 text-center">Secure Gateway for Personal Orchestrator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="admin" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-accent-primary transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50 transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_rgba(56,189,248,0.2)] active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">
              Authorized access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
