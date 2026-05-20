"use client";

import { useState, useEffect } from "react";
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

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Unknown";
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface m-0">Volumes</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage persistent data storage across containers.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-primary text-on-primary font-title-sm text-title-sm py-sm px-md rounded-DEFAULT hover:opacity-90 transition-opacity flex items-center gap-xs shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Volume
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-surface border border-outline-variant rounded-DEFAULT p-md shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all origin-top">
          <h3 className="font-title-sm text-title-sm text-on-surface mb-sm">New Volume Configuration</h3>
          <div className="flex items-end gap-md">
            <div className="flex-1 max-w-md">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-xs">VOLUME NAME</label>
              <input 
                type="text" 
                placeholder="e.g., db_data_production" 
                className="w-full bg-surface-container-low border border-outline focus:border-primary focus:bg-surface-container-lowest outline-none font-code-md text-code-md text-on-surface px-sm py-sm rounded-DEFAULT transition-colors"
                value={newVolumeName}
                onChange={(e) => setNewVolumeName(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="bg-surface text-on-surface border border-outline-variant font-title-sm text-title-sm py-sm px-md rounded-DEFAULT hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!newVolumeName.trim()}
              className="bg-primary text-on-primary font-title-sm text-title-sm py-sm px-md rounded-DEFAULT hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="bg-surface border border-outline-variant rounded-DEFAULT overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {loading && volumes.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl opacity-50">refresh</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-error">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-sm px-md border-b border-outline-variant font-medium">NAME</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-sm px-md border-b border-outline-variant font-medium">DRIVER</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-sm px-md border-b border-outline-variant font-medium">MOUNTPOINT</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-sm px-md border-b border-outline-variant font-medium w-32">CREATED</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant py-sm px-md border-b border-outline-variant font-medium text-right w-24">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-outline-variant">
                {volumes.map(volume => (
                  <tr key={volume.name} className="group hover:bg-surface-container-low transition-colors duration-150">
                    <td className="py-sm px-md font-code-md text-code-md text-on-surface">{volume.name}</td>
                    <td className="py-sm px-md text-on-surface-variant">{volume.driver}</td>
                    <td className="py-sm px-md font-code-sm text-code-sm text-on-surface-variant truncate max-w-[300px]" title={volume.mountpoint}>{volume.mountpoint}</td>
                    <td className="py-sm px-md text-on-surface-variant font-body-sm text-body-sm">{formatDate(volume.created)}</td>
                    <td className="py-sm px-md text-right">
                      <button 
                        onClick={() => handleDelete(volume.name)}
                        className="text-error hover:bg-error-container p-xs rounded-DEFAULT inline-flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100" 
                        title="Remove Volume"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {volumes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-on-surface-variant">No volumes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {!loading && !error && (
        <div className="mt-md flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
          <span>Showing {volumes.length} volumes</span>
        </div>
      )}
    </div>
  );
}
