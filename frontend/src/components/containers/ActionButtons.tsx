'use client';

type ActionButtonsProps = {
  status: 'running' | 'stopped';
  onStart: () => void;
  onStop: () => void;
  onDelete: () => void;
};

export default function ActionButtons({ status, onStart, onStop, onDelete }: ActionButtonsProps) {
  const isRunning = status === 'running';

  return (
    <div className="flex items-center space-x-3">
      {!isRunning ? (
        <button 
          onClick={onStart} 
          className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
        >
          Démarrer
        </button>
      ) : (
        <button 
          onClick={onStop} 
          className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
        >
          Arrêter
        </button>
      )}
      
      <button 
        onClick={onDelete} 
        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
      >
        Supprimer
      </button>
    </div>
  );
}
