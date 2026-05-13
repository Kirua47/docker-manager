"use client";

import { useState } from "react";
import { Plus, Search, Filter, Box } from "lucide-react";
import ContainerCard from "@/components/containers/ContainerCard";
import LogsModal from "@/components/containers/LogsModal";
import CreateContainerModal from "@/components/containers/CreateContainerModal";

const MOCK_CONTAINERS = [
  {
    id: "1",
    name: "Web-App-Prod",
    image: "nginx:latest",
    status: "running" as const,
    cpu: "2.4%",
    ram: "128MB",
  },
  {
    id: "2",
    name: "Postgres-DB",
    image: "postgres:15-alpine",
    status: "running" as const,
    cpu: "1.2%",
    ram: "256MB",
  },
  {
    id: "3",
    name: "Redis-Cache",
    image: "redis:7.0",
    status: "exited" as const,
    cpu: "0%",
    ram: "0MB",
  },
  {
    id: "4",
    name: "API-Gateway",
    image: "traefik:v2.9",
    status: "running" as const,
    cpu: "0.8%",
    ram: "64MB",
  },
];

export default function ContainersPage() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);

  const handleAction = (action: string, id: string) => {
    if (action === "logs") {
      const container = MOCK_CONTAINERS.find(c => c.id === id);
      setSelectedLogs(container?.name || null);
    }
    console.log(`Action ${action} on container ${id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Containers</h1>
        <p className="text-zinc-500">Manage lifecycle and configuration of your services.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search containers..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-accent-primary transition-colors text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="glass flex-1 sm:flex-none px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-none bg-accent-primary hover:bg-accent-primary/90 text-zinc-950 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Deploy</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CONTAINERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((container) => (
          <div key={container.id} className="relative group">
            <ContainerCard 
              {...container} 
              onAction={handleAction} 
            />
            <button 
              onClick={() => handleAction("logs", container.id)}
              className="absolute top-4 right-14 p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-accent-primary opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="View Logs"
            >
              <Box className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <CreateContainerModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={() => {}}
      />

      <LogsModal 
        containerName={selectedLogs || ""} 
        isOpen={!!selectedLogs} 
        onClose={() => setSelectedLogs(null)} 
      />
    </div>
  );
}
