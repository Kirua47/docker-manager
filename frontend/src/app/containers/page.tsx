"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Box, Loader2, RefreshCw } from "lucide-react";
import ContainerCard from "@/components/containers/ContainerCard";
import LogsModal from "@/components/containers/LogsModal";
import CreateContainerModal from "@/components/containers/CreateContainerModal";
import { containerService } from "@/lib/api";

export default function ContainersPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);
  const [logsContent, setLogsContent] = useState("");

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = await containerService.list();
      setContainers(data);
    } catch (err) {
      setError("Failed to load containers. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "logs") {
        const logs = await containerService.getLogs(id);
        setLogsContent(logs);
        const container = containers.find(c => c.id === id);
        setSelectedLogs(container?.name || "Container");
      } else if (action === "start") {
        await containerService.start(id);
        await fetchContainers();
      } else if (action === "stop") {
        await containerService.stop(id);
        await fetchContainers();
      } else if (action === "restart") {
        await containerService.restart(id);
        await fetchContainers();
      } else if (action === "delete") {
        if (confirm("Are you sure you want to delete this container?")) {
          await containerService.delete(id);
          await fetchContainers();
        }
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleCreate = async (data: { name: string; image: string }) => {
    try {
      await containerService.create(data);
      setIsCreateOpen(false);
      await fetchContainers();
    } catch (err: any) {
      alert(`Deployment failed: ${err.message}`);
    }
  };

  const filteredContainers = containers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.image.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Containers</h1>
          <button 
            onClick={fetchContainers}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {loading && containers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-20" />
          <p>Loading containers...</p>
        </div>
      ) : error ? (
        <div className="glass rounded-3xl p-12 text-center space-y-4 border-rose-500/20">
          <p className="text-rose-500 font-medium">{error}</p>
          <button onClick={fetchContainers} className="text-accent-primary hover:underline font-semibold">Try again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContainers.map((container) => (
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
          {filteredContainers.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed">
              <p className="text-zinc-500">No containers found matching your search.</p>
            </div>
          )}
        </div>
      )}

      <CreateContainerModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={handleCreate}
      />

      <LogsModal 
        containerName={selectedLogs || ""} 
        logs={logsContent}
        isOpen={!!selectedLogs} 
        onClose={() => setSelectedLogs(null)} 
      />
    </div>
  );
}
