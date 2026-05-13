'use client';

import { useState } from 'react';
import ContainerList from '@/components/dashboard/ContainerList';
import CreationForm from '@/components/containers/CreationForm';
import SearchBar from '@/components/images/SearchBar';
import LogsModal from '@/components/monitoring/LogsModal';

export default function DashboardPage() {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [currentLogs, setCurrentLogs] = useState("");

  // Mock
  const mockContainers = [
    { id: '1', name: 'nginx-proxy', image: 'nginx:latest', status: 'running' as const },
    { id: '2', name: 'db-mysql', image: 'mysql:8', status: 'stopped' as const }
  ];

  const handleSearch = (query: string) => alert(`Recherche de l'image sur Docker Hub : ${query}`);
  const handleDeploy = (data: any) => alert(`Déploiement en cours de ${data.name} avec l'image ${data.image}`);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Tableau de Bord
            </h1>
            <p className="text-slate-400 mt-2">Gérez vos containers locaux et déployez de nouvelles images.</p>
          </div>
          <div className="w-full md:w-96">
            <SearchBar onSearch={handleSearch} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Vos Containers</h2>
              <button 
                onClick={() => { setCurrentLogs("Mock logs system start\\n[OK] Daemon ready.\\n[INFO] Listening on port 80"); setIsLogsOpen(true); }} 
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Voir les logs serveur
              </button>
            </div>
            <ContainerList containers={mockContainers} />
          </div>
          <div className="sticky top-8">
             <CreationForm onSubmit={handleDeploy} />
          </div>
        </div>
      </div>

      <LogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} logs={currentLogs} />
    </div>
  );
}
