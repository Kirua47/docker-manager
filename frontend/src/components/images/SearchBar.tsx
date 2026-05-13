'use client';
import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if(query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex space-x-2 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une image sur le Hub..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" 
        />
      </div>
      <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5">
        Chercher
      </button>
    </form>
  );
}
