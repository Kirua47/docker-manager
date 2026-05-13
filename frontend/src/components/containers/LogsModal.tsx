"use client";

import { X, Terminal as TerminalIcon, Copy, Download } from "lucide-react";

interface LogsModalProps {
  containerName: string;
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_LOGS = [
  "[2026-05-13 14:20:01] INFO: Starting server on port 80...",
  "[2026-05-13 14:20:02] DEBUG: Loading configuration...",
  "[2026-05-13 14:20:05] SUCCESS: Connected to database.",
  "[2026-05-13 14:21:10] GET /api/v1/health 200 OK",
  "[2026-05-13 14:21:15] GET /api/v1/containers 200 OK",
  "[2026-05-13 14:22:30] WARNING: High memory usage detected.",
  "[2026-05-13 14:23:01] GET /api/v1/logs 200 OK",
  "[2026-05-13 14:24:00] INFO: Periodic cleanup completed.",
];

export default function LogsModal({ containerName, isOpen, onClose }: LogsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-4xl h-[70vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border-white/10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
              <TerminalIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Logs: {containerName}</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Real-time container stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-black/40 p-6 overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar">
          {MOCK_LOGS.map((log, i) => {
            const isError = log.includes("ERROR");
            const isWarning = log.includes("WARNING");
            const isSuccess = log.includes("SUCCESS");
            
            return (
              <div key={i} className="flex gap-4 group">
                <span className="text-zinc-700 select-none w-6">{i + 1}</span>
                <p className={clsx(
                  "flex-1",
                  isError && "text-rose-400",
                  isWarning && "text-amber-400",
                  isSuccess && "text-emerald-400",
                  !isError && !isWarning && !isSuccess && "text-zinc-300"
                )}>
                  {log}
                </p>
              </div>
            );
          })}
          <div className="animate-pulse w-2 h-4 bg-accent-primary/50 inline-block ml-10 mt-2" />
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-tighter">Live Connection Established</span>
          </div>
          <button className="text-xs text-accent-primary hover:underline font-semibold">
            Auto-scroll enabled
          </button>
        </div>
      </div>
    </div>
  );
}

function clsx(...args: any[]) {
  return args.filter(Boolean).join(" ");
}
