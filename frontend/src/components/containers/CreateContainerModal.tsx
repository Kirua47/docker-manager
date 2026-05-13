"use client";

import { useState } from "react";
import { X, Box, Globe, Shield, HardDrive, Plus, ArrowRight } from "lucide-react";

interface CreateContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; image: string }) => void;
}

export default function CreateContainerModal({ isOpen, onClose, onSubmit }: CreateContainerModalProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, image });
    setName("");
    setImage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in zoom-in-95 duration-300">
      <div className="glass w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-secondary/10 text-accent-secondary">
              <Box className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl">Deploy New Container</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Container Name</label>
              <input 
                type="text" 
                placeholder="e.g. my-awesome-app" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-accent-primary transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">Image Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. nginx:latest" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-accent-primary transition-all"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent-primary hover:underline">
                  Search Hub
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Port Mapping
                </label>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="80" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                  <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  <input type="text" placeholder="8080" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 ml-1 flex items-center gap-2">
                  <HardDrive className="w-3 h-3" /> Volume
                </label>
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="/data" className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full bg-white text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-zinc-200 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>Create Container</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
