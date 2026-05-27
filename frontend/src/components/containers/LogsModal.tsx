"use client";

import { X, Terminal as TerminalIcon, Copy, Download } from "lucide-react";

interface LogsModalProps {
  containerName: string;
  logs?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LogsModal({ containerName, logs = "", isOpen, onClose }: LogsModalProps) {
  if (!isOpen) return null;

  const logLines = logs.split('\n');

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
              <p className="text-zinc-500 text-xs uppercase tracking-wider">Container output stream</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigator.clipboard.writeText(logs)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Copy all logs"
            >
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
          {logLines.length > 0 && logLines[0] !== "" ? (
            logLines.map((log, i) => {
              const isError = log.toLowerCase().includes("error");
              const isWarning = log.toLowerCase().includes("warning") || log.toLowerCase().includes("warn");
              const isSuccess = log.toLowerCase().includes("success") || log.toLowerCase().includes("ok");
              
              return (
                <div key={i} className="flex gap-4 group">
                  <span className="text-zinc-700 select-none w-8 text-right">{i + 1}</span>
                  <p className={clsx(
                    "flex-1 break-all",
                    isError && "text-rose-400",
                    isWarning && "text-amber-400",
                    isSuccess && "text-emerald-400",
                    !isError && !isWarning && !isSuccess && "text-zinc-300"
                  )}>
                    {log}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-zinc-600 italic">No logs available for this container.</p>
          )}
          <div className="animate-pulse w-2 h-4 bg-accent-primary/50 inline-block ml-10 mt-2" />
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-tighter">Connection Active</span>
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
