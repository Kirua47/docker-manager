"use client";

import { useState } from "react";
import { Search, Download, Layers, ShieldCheck, Clock, ExternalLink } from "lucide-react";

const MOCK_IMAGES = [
  { name: "nginx", tag: "latest", size: "142MB", pulled: "2 days ago", official: true },
  { name: "postgres", tag: "15-alpine", size: "230MB", pulled: "5 days ago", official: true },
  { name: "redis", tag: "7.0", size: "110MB", pulled: "1 week ago", official: true },
  { name: "traefik", tag: "v2.9", size: "85MB", pulled: "3 days ago", official: true },
  { name: "node", tag: "18-slim", size: "180MB", pulled: "Just now", official: true },
];

export default function ImagesPage() {
  const [search, setSearch] = useState("");

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
              placeholder="Search Docker Hub (e.g. mysql, python, rust...)" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent-primary transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="w-full sm:w-auto bg-white text-zinc-950 font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 active:scale-95">
            <Download className="w-5 h-5" />
            <span>Pull Image</span>
          </button>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-secondary" />
              Local Images
            </h3>
            <span className="text-xs text-zinc-500 font-mono">{MOCK_IMAGES.length} TOTAL IMAGES</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MOCK_IMAGES.map((image, i) => (
              <div key={i} className="glass bg-white/5 border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-accent-primary transition-colors">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{image.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 font-mono">{image.tag}</span>
                      {image.official && <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Official Image" />}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {image.pulled}</span>
                      <span>{image.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Box({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function Trash2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
