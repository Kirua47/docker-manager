'use client';
import { useState } from 'react';

export default function CreationForm({ onSubmit }: { onSubmit: (data: {name: string, image: string}) => void }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, image });
    setName('');
    setImage('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-5 backdrop-blur-md shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Nouveau Container</h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Nom du container</label>
        <input 
          id="name" required value={name} onChange={(e) => setName(e.target.value)}
          placeholder="ex: my-db"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
        />
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-slate-300 mb-1">Image Docker</label>
        <input 
          id="image" required value={image} onChange={(e) => setImage(e.target.value)}
          placeholder="ex: mysql:8"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
        />
      </div>
      
      <button type="submit" className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5">
        Déployer
      </button>
    </form>
  );
}
