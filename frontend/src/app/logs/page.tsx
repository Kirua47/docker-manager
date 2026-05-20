"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { containerService } from "@/lib/api";

function colorClass(line: string): string {
  const l = line.toLowerCase();
  if (l.includes("error") || l.includes("fatal") || l.includes("crit")) return "text-[#f38ba8]";
  if (l.includes("warn")) return "text-[#fab387]";
  if (l.includes("info")) return "text-[#89dceb]";
  if (l.includes("debug") || l.includes("trace")) return "text-[#a6e3a1]";
  return "text-[#cdd6f4]";
}

function LogsPageInner() {
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get("container") || "none";

  const [containers, setContainers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>(preSelectedId);
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [tail, setTail] = useState<number>(500);
  const [timestamps, setTimestamps] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    containerService.list().then(data => setContainers(data)).catch(() => {});
  }, []);

  const fetchLogs = useCallback(async (id: string) => {
    if (!id || id === "none") return;
    setLoading(true);
    setError(null);
    try {
      const data = await containerService.getLogs(id, tail, timestamps);
      setLogs(data || "");
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || "Failed to fetch logs");
      setLogs("");
    } finally {
      setLoading(false);
    }
  }, [tail, timestamps]);

  useEffect(() => {
    if (selectedId === "none") { setLogs(""); setError(null); return; }
    fetchLogs(selectedId);
  }, [selectedId, fetchLogs]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh && selectedId !== "none") {
      intervalRef.current = setInterval(() => fetchLogs(selectedId), 5000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, selectedId, fetchLogs]);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const filteredLines = logs.split("\n").filter(line => filter ? line.toLowerCase().includes(filter.toLowerCase()) : true);
  const selectedContainer = containers.find(c => c.id === selectedId);

  function downloadLogs() {
    const blob = new Blob([logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedContainer?.name || "container"}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-lg gap-md shrink-0">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface mb-xs">Container Logs</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Live log viewer — select a container to begin
            {lastUpdated && selectedId !== "none" && <span className="ml-2 text-xs opacity-60">· updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
          <div className="relative">
            <select id="log-container-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="appearance-none bg-surface border border-outline-variant rounded-lg px-sm py-2 pr-8 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer">
              <option value="none">Select a container…</option>
              {containers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">arrow_drop_down</span>
          </div>
          <div className="relative">
            <select id="log-tail-select" value={tail} onChange={e => setTail(parseInt(e.target.value))}
              className="appearance-none bg-surface border border-outline-variant rounded-lg px-sm py-2 pr-8 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors cursor-pointer">
              <option value={100}>Last 100 lines</option>
              <option value={500}>Last 500 lines</option>
              <option value={1000}>Last 1000 lines</option>
              <option value={2000}>Last 2000 lines</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">arrow_drop_down</span>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
            <input type="text" id="log-filter-input" placeholder="Filter lines…" value={filter} onChange={e => setFilter(e.target.value)}
              className="pl-8 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary transition-colors w-44" />
          </div>
          <button id="log-timestamps-btn" onClick={() => setTimestamps(t => !t)}
            className={`flex items-center gap-xs px-sm py-2 rounded-lg text-sm border transition-colors ${timestamps ? "bg-primary text-on-primary border-primary" : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`} title="Toggle timestamps">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span className="hidden sm:inline">Timestamps</span>
          </button>
          <button id="log-autorefresh-btn" onClick={() => setAutoRefresh(a => !a)}
            className={`flex items-center gap-xs px-sm py-2 rounded-lg text-sm border transition-colors ${autoRefresh ? "bg-[#00a48d] text-white border-[#00a48d]" : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`} title="Toggle auto-refresh">
            <span className={`material-symbols-outlined text-[16px] ${autoRefresh ? "animate-spin" : ""}`}>refresh</span>
            <span className="hidden sm:inline">{autoRefresh ? "Live" : "Paused"}</span>
          </button>
          <button id="log-download-btn" onClick={downloadLogs} disabled={!logs}
            className="flex items-center gap-xs px-sm py-2 rounded-lg text-sm border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed" title="Download logs">
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="hidden sm:inline">Download</span>
          </button>
          <button id="log-refresh-btn" onClick={() => fetchLogs(selectedId)} disabled={selectedId === "none" || loading}
            className="flex items-center gap-xs px-sm py-2 rounded-lg text-sm border border-outline-variant bg-surface text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>sync</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1e1e2e] rounded-xl border border-outline-variant overflow-hidden flex flex-col shadow-xl min-h-[520px]">
        <div className="bg-[#181825] px-md py-2 border-b border-[#313244] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-sm">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
              <div className="w-3 h-3 rounded-full bg-[#fab387]" />
              <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
            </div>
            <span className="text-[#cdd6f4] text-xs font-mono ml-2 opacity-70">
              {selectedId === "none" ? "no container selected" : selectedContainer ? `${selectedContainer.name} — ${filteredLines.filter(l => l).length} lines` : "loading…"}
            </span>
          </div>
          <div className="flex items-center gap-md">
            {loading && <span className="flex items-center gap-1 text-[#89dceb] text-xs"><span className="material-symbols-outlined animate-spin text-[14px]">refresh</span> Fetching…</span>}
            {!loading && autoRefresh && selectedId !== "none" && (
              <span className="flex items-center gap-1 text-[#a6e3a1] text-xs"><span className="w-1.5 h-1.5 rounded-full bg-[#a6e3a1] animate-pulse inline-block" /> Live</span>
            )}
            {filter && <span className="text-[#fab387] text-xs">{filteredLines.filter(l => l).length} matches</span>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-md font-mono text-[13px] leading-relaxed">
          {selectedId === "none" ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7086] gap-4">
              <span className="material-symbols-outlined text-5xl opacity-30">terminal</span>
              <p>Select a container above to view its logs</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-[#f38ba8] gap-3">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p>{error}</p>
              <button onClick={() => fetchLogs(selectedId)} className="text-xs border border-[#f38ba8] px-3 py-1 rounded hover:bg-[#f38ba8]/10 transition-colors">Retry</button>
            </div>
          ) : loading && !logs ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7086] gap-3">
              <span className="material-symbols-outlined animate-spin text-4xl opacity-40">refresh</span>
              <p className="text-sm">Loading logs…</p>
            </div>
          ) : filteredLines.filter(l => l).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#6c7086] gap-2">
              <span className="material-symbols-outlined text-4xl opacity-30">inbox</span>
              <p>{filter ? "No lines match your filter." : "No logs available for this container."}</p>
            </div>
          ) : (
            <>
              {filteredLines.map((line, i) => line ? (
                <div key={i} className={`mb-0.5 break-all whitespace-pre-wrap ${colorClass(line)}`}>
                  <span className="text-[#585b70] select-none mr-3 text-[11px]">{String(i + 1).padStart(4, " ")}</span>
                  {line}
                </div>
              ) : <div key={i} className="h-2" />)}
              <div ref={logsEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-32 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl opacity-40">refresh</span>
      </div>
    }>
      <LogsPageInner />
    </Suspense>
  );
}
