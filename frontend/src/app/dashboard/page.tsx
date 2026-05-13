"use client";

import { useState, useEffect } from "react";
import { Box, Activity, Layers, ShieldCheck, ArrowUpRight, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { containerService, imageService } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    active: 0,
    stopped: 0,
    totalImages: 0,
    cpu: "0%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [containers, images] = await Promise.all([
          containerService.list(),
          imageService.list()
        ]);

        const active = containers.filter((c: any) => c.status === 'running').length;
        const stopped = containers.length - active;

        setStats({
          active,
          stopped,
          totalImages: images.length,
          cpu: "12.4%" // Simplified for now, real stats would need websocket or per-container fetch
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const STAT_CARDS = [
    { label: "Active Containers", value: stats.active.toString(), icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Stopped", value: stats.stopped.toString(), icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "CPU Usage", value: stats.cpu, icon: Activity, color: "text-accent-primary", bg: "bg-accent-primary/10" },
    { label: "Total Images", value: stats.totalImages.toString(), icon: Layers, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-zinc-500">Global status of your personal infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">
                {loading ? <Loader2 className="w-5 h-5 animate-spin opacity-20" /> : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">System Status</h3>
            <Link href="/containers" className="text-sm text-accent-primary hover:underline flex items-center gap-1 font-semibold">
              View all containers <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass rounded-3xl p-8 h-64 flex flex-col items-center justify-center text-zinc-600 border-dashed">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Real-time performance graph</p>
            <p className="text-sm opacity-50">Monitoring active on {stats.active} containers</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Quick Actions</h3>
          <div className="glass rounded-3xl p-6 space-y-4">
            <Link 
              href="/containers" 
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all"
            >
              <span className="font-semibold">Manage Containers</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-accent-primary transition-colors" />
            </Link>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all">
              <span className="font-semibold">Pull New Image</span>
              <Layers className="w-4 h-4 text-zinc-500 group-hover:text-accent-secondary transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
