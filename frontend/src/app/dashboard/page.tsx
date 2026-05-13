"use client";

import { Box, Activity, Layers, ShieldCheck, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Active Containers", value: "3", icon: Box, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Stopped", value: "1", icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10" },
  { label: "CPU Usage", value: "14.2%", icon: Activity, color: "text-accent-primary", bg: "bg-accent-primary/10" },
  { label: "Total Images", value: "5", icon: Layers, color: "text-accent-secondary", bg: "bg-accent-secondary/10" },
];

const RECENT_ACTIVITIES = [
  { action: "Container Started", target: "Web-App-Prod", time: "2 mins ago" },
  { action: "Image Pulled", target: "nginx:latest", time: "15 mins ago" },
  { action: "Container Deleted", target: "test-redis", time: "1 hour ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-zinc-500">Global status of your personal infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
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
            <p className="font-medium">Real-time performance graph will appear here</p>
            <p className="text-sm opacity-50">Connect to Backend to start monitoring</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Recent Activity</h3>
          <div className="glass rounded-3xl overflow-hidden divide-y divide-white/5">
            {RECENT_ACTIVITIES.map((activity, i) => (
              <div key={i} className="p-4 flex items-start gap-4 hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent-primary mt-2" />
                <div>
                  <p className="font-semibold text-sm">{activity.action}</p>
                  <p className="text-xs text-zinc-500 mt-1">{activity.target}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
