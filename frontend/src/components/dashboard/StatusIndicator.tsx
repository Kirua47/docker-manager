export default function StatusIndicator({ status }: { status: 'running' | 'stopped' }) {
  const isRunning = status === 'running';
  return (
    <span className="flex items-center space-x-2">
      <span 
        data-testid="status-indicator" 
        className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${isRunning ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
      ></span>
      <span className="text-sm font-semibold text-slate-300 capitalize">{status}</span>
    </span>
  );
}
