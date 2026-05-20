"use client";

import { useState, useEffect } from "react";
import { HardDrive, Plus, Loader2, Trash2, RefreshCw } from "lucide-react";
import { volumeService } from "@/lib/api";

export default function VolumesPage() {
  const [volumes, setVolumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newVolumeName, setNewVolumeName] = useState("");

  const fetchVolumes = async () => {
    try {
      setLoading(true);
      const data = await volumeService.list();
      setVolumes(data);
    } catch (err) {
      setError("Failed to load volumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVolumeName.trim()) return;
    try {
      await volumeService.create(newVolumeName.trim());
      setNewVolumeName("");
      setIsCreating(false);
      await fetchVolumes();
    } catch (err: any) {
      alert(`Failed to create volume: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this volume?")) {
      try {
        await volumeService.delete(id);
        await fetchVolumes();
      } catch (err: any) {
        alert(`Failed to delete volume: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Volumes</h1>
          <button 
            onClick={fetchVolumes}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-zinc-500">Manage your persistent data storage volumes.</p>
      </div>

      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-accent-primary hover:bg-accent-primary/90 text-zinc-950 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create Volume</span>
        </button>
      </div>

      {isCreating && (
        <div className="glass p-6 rounded-3xl mb-8 flex items-end gap-4 border border-accent-primary/30">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">New Volume Name</label>
            <input 
              type="text" 
              placeholder="my_data_volume" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-accent-primary transition-all"
              value={newVolumeName}
              onChange={(e) => setNewVolumeName(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            onClick={handleCreate}
            className="bg-white text-zinc-950 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200"
          >
            Create
          </button>
          <button 
            onClick={() => setIsCreating(false)}
            className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {loading && volumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-20" />
          <p>Loading volumes...</p>
        </div>
      ) : error ? (
        <div className="glass rounded-3xl p-12 text-center space-y-4 border-rose-500/20">
          <p className="text-rose-500 font-medium">{error}</p>
          <button onClick={fetchVolumes} className="text-accent-primary hover:underline font-semibold">Try again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {volumes.map((volume) => (
            <div key={volume.name} className="glass rounded-3xl p-6 flex flex-col gap-4 relative group">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold truncate max-w-[200px]" title={volume.name}>{volume.name}</h3>
                  <p className="text-sm text-zinc-500 capitalize">{volume.driver} driver</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Mountpoint</p>
                <p className="text-sm truncate text-zinc-300" title={volume.mountpoint}>{volume.mountpoint}</p>
              </div>
              <button 
                onClick={() => handleDelete(volume.name)}
                className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Volume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {volumes.length === 0 && !isCreating && (
            <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed">
              <p className="text-zinc-500">No volumes found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
