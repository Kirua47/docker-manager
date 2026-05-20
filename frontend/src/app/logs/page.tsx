"use client";

import { useState, useEffect } from "react";
import { Terminal, Search, ChevronRight, Activity, Loader2 } from "lucide-react";
import LogsModal from "@/components/containers/LogsModal";
import { containerService } from "@/lib/api";

interface Container {
  id: string;
  name: string;
  status: string;
  image: string;
}

export default function LogsPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);
  const [logsContent, setLogsContent] = useState<string>("");
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const data = await containerService.list();
      setContainers(data);
    } catch (error) {
      console.error("Failed to fetch containers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async (container: Container) => {
    try {
      setLoadingLogs(true);
      const logs = await containerService.getLogs(container.id);
      setLogsContent(logs);
      setSelectedLogs(container.name);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const filteredContainers = containers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.image.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
            </div>
          ) : filteredContainers.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No containers found matching your search.
            </div>
          ) : (
            filteredContainers.map((container) => (
              <button 
                key={container.id}
                onClick={() => handleViewLogs(container)}
                disabled={loadingLogs}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors group disabled:opacity-50"
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
            ))
          )}
        </div>
      </div>

      <LogsModal 
        containerName={selectedLogs || ""} 
        logs={logsContent}
        isOpen={!!selectedLogs} 
        onClose={() => {
          setSelectedLogs(null);
          setLogsContent("");
        }} 
      />
    </div>
  );
}
