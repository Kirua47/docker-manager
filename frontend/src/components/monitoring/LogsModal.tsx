'use client';

export default function LogsModal({ isOpen, onClose, logs }: { isOpen: boolean, onClose: () => void, logs: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <h3 className="text-white font-bold tracking-wide">Logs du container</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-4 bg-black/50 overflow-y-auto flex-1 font-mono text-sm text-green-400 whitespace-pre-wrap selection:bg-green-900 selection:text-green-100 min-h-[300px]">
          {logs || "En attente de logs..."}
        </div>
      </div>
    </div>
  );
}
