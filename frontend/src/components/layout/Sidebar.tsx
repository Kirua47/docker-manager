"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { name: "Containers", href: "/containers", icon: "view_in_ar" },
    { name: "Images", href: "/images", icon: "layers" },
    { name: "Volumes", href: "/volumes", icon: "storage" },
    { name: "Logs", href: "/logs", icon: "terminal" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  const getLinkClasses = (href: string) => {
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);
    if (isActive) {
      return "flex items-center gap-md px-md py-sm rounded bg-secondary-container text-primary border-l-4 border-primary cursor-pointer active:opacity-80 transition-colors";
    }
    return "flex items-center gap-md px-md py-sm rounded text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80 border-l-4 border-transparent";
  };

  return (
    <nav className="hidden md:flex flex-col w-sidebar_width h-full px-md py-lg bg-background border-r border-outline-variant fixed left-0 top-0 z-20">
      <div className="mb-xl flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary text-3xl" data-weight="fill">token</span>
        <div>
          <div className="font-headline-md text-headline-md font-bold text-primary">Docker Console</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">v2.4.0-stable</div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col gap-sm overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.name} href={item.href} className={getLinkClasses(item.href)}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-title-sm text-title-sm">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-lg border-t border-outline-variant flex flex-col gap-sm">
        <a className="flex items-center gap-md px-md py-sm rounded text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80" href="#">
          <span className="material-symbols-outlined">description</span>
          <span className="font-title-sm text-title-sm">Documentation</span>
        </a>
        <a className="flex items-center gap-md px-md py-sm rounded text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:opacity-80" href="#">
          <span className="material-symbols-outlined">help</span>
          <span className="font-title-sm text-title-sm">Support</span>
        </a>
        <Link href="/containers/create" className="mt-md w-full bg-primary text-on-primary py-sm rounded font-title-sm text-title-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm text-center block">
          Deploy New
        </Link>
      </div>
    </nav>
  );
}
