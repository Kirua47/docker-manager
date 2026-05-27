'use client';

import StatusIndicator from './StatusIndicator';
import ActionButtons from '../containers/ActionButtons';

export default function ContainerList({ containers }: { containers: any[] }) {
  if (!containers || containers.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
        Aucun container trouvé sur ce serveur.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {containers.map((c) => (
        <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 backdrop-blur-md shadow-lg group">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{c.name}</h3>
            <p className="text-sm text-slate-400 mt-1 font-mono">{c.image}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-6">
            <StatusIndicator status={c.status} />
            <ActionButtons 
              status={c.status} 
              onStart={() => console.log(`Démarrer ${c.name}`)} 
              onStop={() => console.log(`Arrêter ${c.name}`)} 
              onDelete={() => console.log(`Supprimer ${c.name}`)} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
