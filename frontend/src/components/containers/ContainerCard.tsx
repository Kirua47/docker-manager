"use client";

import { 
  Play, 
  Square, 
  RotateCw, 
  Trash2, 
  Activity, 
  Cpu, 
  HardDrive 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ContainerProps {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "paused" | "restarting";
  cpu: string;
  ram: string;
  onAction: (action: string, id: string) => void;
}

export default function ContainerCard({ 
  id, 
  name, 
  image, 
  status, 
  cpu, 
  ram,
  onAction 
}: ContainerProps) {
  const isRunning = status === "running";

  return (
    <div className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10",
            isRunning ? "text-status-active shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-status-stopped"
          )}>
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-none">{name}</h3>
            <p className="text-zinc-500 text-sm mt-1 font-mono">{image}</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          isRunning 
            ? "bg-status-active/10 text-status-active border-status-active/20" 
            : "bg-status-stopped/10 text-status-stopped border-status-stopped/20"
        )}>
          {status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <Cpu className="w-3 h-3" /> CPU USAGE
          </div>
          <div className="text-sm font-semibold">{cpu}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
            <HardDrive className="w-3 h-3" /> RAM USAGE
          </div>
          <div className="text-sm font-semibold">{ram}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
        <div className="flex gap-2">
          {!isRunning ? (
            <button 
              onClick={() => onAction("start", id)}
              className="p-2 rounded-lg bg-status-active/20 text-status-active hover:bg-status-active/30 transition-colors"
              title="Start"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button 
              onClick={() => onAction("stop", id)}
              className="p-2 rounded-lg bg-status-stopped/20 text-status-stopped hover:bg-status-stopped/30 transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}
          <button 
            onClick={() => onAction("restart", id)}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Restart"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => onAction("delete", id)}
          className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
