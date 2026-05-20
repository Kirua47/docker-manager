"use client";

import { useState, useEffect } from "react";
import { Search, Download, Layers, ShieldCheck, Clock, ExternalLink, Loader2, Trash2, Box } from "lucide-react";
import { imageService } from "@/lib/api";

export default function ImagesPage() {
  const [search, setSearch] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPulling, setIsPulling] = useState(false);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await imageService.list();
      setImages(data);
    } catch (err) {
      setError("Failed to load images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handlePull = async () => {
    if (!search.trim()) return;
    try {
      setIsPulling(true);
      await imageService.pull(search.trim());
      setSearch("");
      await fetchImages();
    } catch (err: any) {
      alert(`Failed to pull image: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "Unknown";
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const parseTag = (tags: string[]) => {
    if (!tags || tags.length === 0) return { name: "<none>", tag: "<none>" };
    const firstTag = tags[0];
    const parts = firstTag.split(":");
    return {
      name: parts[0] || "<none>",
      tag: parts[1] || "latest"
    };
  };

  const parseId = (id: string) => {
    return id.replace("sha256:", "").substring(0, 12);
  };

  const filteredImages = images.filter(img => {
    const { name, tag } = parseTag(img.tags);
    return name.toLowerCase().includes(search.toLowerCase()) || 
           tag.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Image Management</h1>
        <p className="text-zinc-500">Pull and manage Docker images from Hub.</p>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search local images or enter image to pull (e.g. mysql)..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePull()}
            />
          </div>
          <button 
            onClick={handlePull}
            disabled={isPulling || !search.trim()}
            className="w-full sm:w-auto bg-white text-zinc-950 font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isPulling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isPulling ? "Pulling..." : "Pull Image"}</span>
          </button>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-secondary" />
              Local Images
            </h3>
            <span className="text-xs text-zinc-500 font-mono">{filteredImages.length} TOTAL IMAGES</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 opacity-20" />
              <p>Loading images...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-rose-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredImages.map((image, i) => {
                const { name, tag } = parseTag(image.tags);
                return (
                  <div key={i} className="glass bg-white/5 border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-accent-primary transition-colors">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">{tag}</span>
                          <span className="text-xs text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded-md ml-2" title="Short ID">{parseId(image.id)}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1" title="Created At"><Clock className="w-3 h-3" /> {formatDate(image.created)}</span>
                          <span title="Size">{formatSize(image.size)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredImages.length === 0 && (
                <div className="py-20 text-center glass rounded-3xl border-dashed">
                  <p className="text-zinc-500">No images found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
