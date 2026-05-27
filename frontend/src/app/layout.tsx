import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Docker Console",
  description: "Personal Docker Orchestrator - Manage your containers with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-body-md text-body-md antialiased flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col md:ml-sidebar_width w-full h-full bg-surface-container-lowest relative">
          <Header />
          <main className="flex-1 overflow-y-auto pt-24 pb-lg px-lg max-w-max_content_width mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
