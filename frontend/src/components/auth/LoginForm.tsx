'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation du temps de connexion API (Mock)
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md p-8 space-y-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Bienvenue</h2>
        <p className="mt-2 text-sm text-slate-300">Connectez-vous pour piloter vos containers</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-200">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="admin@docker.local"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Mot de passe
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="••••••••"
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Se connecter'}
        </button>
      </div>
    </form>
  );
}
