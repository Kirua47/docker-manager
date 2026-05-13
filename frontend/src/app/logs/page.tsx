"use client";

import { useState } from "react";
import { Terminal, Search, ChevronRight, Activity } from "lucide-react";
import LogsModal from "@/components/containers/LogsModal";

const MOCK_CONTAINERS = [
  { id: "1", name: "Web-App-Prod", status: "running" },
  { id: "2", name: "Postgres-DB", status: "running" },
  { id: "3", name: "Redis-Cache", status: "exited" },
  { id: "4", name: "API-Gateway", status: "running" },
];

export default function LogsPage() {
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
        <p className="text-zinc-500">Access real-time streams from all your services.</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-lg">Active Streams</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Filter services..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {MOCK_CONTAINERS.map((container) => (
            <button 
              key={container.id}
              onClick={() => setSelectedLogs(container.name)}
              className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:text-accent-primary transition-colors">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{container.name}</span>
                    <div className={`w-2 h-2 rounded-full ${container.status === 'running' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 uppercase font-mono tracking-tighter">
                    {container.status === 'running' ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 group-hover:text-white transition-colors">
                <span className="text-sm font-medium">View Stream</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <LogsModal 
        containerName={selectedLogs || ""} 
        isOpen={!!selectedLogs} 
        onClose={() => setSelectedLogs(null)} 
      />
    </div>
  );
}
