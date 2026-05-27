"use client";

import React from "react";

export default function Header() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="flex justify-between items-center h-16 px-lg bg-surface border-b border-outline-variant fixed top-0 right-0 w-full md:w-[calc(100%-260px)] z-10">
      <div className="flex items-center gap-md">
        {/* Search */}
        <div className="relative hidden sm:flex items-center focus-within:ring-2 focus-within:ring-primary rounded">
          <span className="material-symbols-outlined absolute left-sm text-on-surface-variant">search</span>
          <input 
            className="pl-[32px] pr-sm py-xs bg-surface-container-low border border-outline-variant rounded font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest w-64 transition-all" 
            placeholder="Search resources..." 
            type="text" 
          />
        </div>
      </div>
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-sm">
          <button className="p-xs text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-high focus-within:ring-2 focus-within:ring-primary cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined">sync</span>
          </button>
          <button className="p-xs text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-high focus-within:ring-2 focus-within:ring-primary cursor-pointer active:opacity-80">
            <span className="material-symbols-outlined">account_tree</span>
          </button>
          <button className="p-xs text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-surface-container-high focus-within:ring-2 focus-within:ring-primary cursor-pointer active:opacity-80 relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
        <div className="flex items-center gap-sm">
          <img 
            alt="User Avatar" 
            className="w-8 h-8 rounded-full border border-outline-variant object-cover cursor-pointer" 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
          />
          <button 
            onClick={handleLogout}
            className="p-xs text-on-surface-variant hover:text-error transition-all rounded-full hover:bg-error-container/30 focus-within:ring-2 focus-within:ring-error cursor-pointer active:opacity-80"
            title="Sign Out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
