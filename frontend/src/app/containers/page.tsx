"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { containerService } from "@/lib/api";

// ─── Exec Terminal Modal ──────────────────────────────────────────────────────
function ExecModal({ container, onClose }: { container: any; onClose: () => void }) {
  const [history, setHistory] = useState<{ cmd: string; output: string; exitCode: number | null; error?: string }[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const runCommand = async () => {
    const cmd = input.trim();
    if (!cmd || running) return;
    setInput("");
    setRunning(true);
    setCmdHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setCmdHistoryIdx(-1);
    try {
      const result = await containerService.exec(container.id, cmd);
      setHistory(prev => [...prev, { cmd, output: result.output, exitCode: result.exit_code }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { cmd, output: "", exitCode: null, error: err.message }]);
    } finally {
      setRunning(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { runCommand(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
      setCmdHistoryIdx(idx);
      if (cmdHistory[idx]) setInput(cmdHistory[idx]);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(cmdHistoryIdx - 1, -1);
      setCmdHistoryIdx(idx);
      setInput(idx === -1 ? "" : cmdHistory[idx]);
    }
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-3xl mx-4 bg-[#1e1e2e] rounded-xl border border-[#313244] shadow-2xl flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Title bar */}
        <div className="bg-[#181825] px-md py-2 border-b border-[#313244] flex items-center justify-between shrink-0 rounded-t-xl">
          <div className="flex items-center gap-sm">
            <div className="flex gap-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-[#f38ba8] hover:bg-[#f38ba8]/80 transition-colors" title="Close" />
              <div className="w-3 h-3 rounded-full bg-[#fab387]" />
              <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
            </div>
            <span className="text-[#cdd6f4] text-xs font-mono ml-2 opacity-70">
              exec — {container.name}
            </span>
            <span className="text-[#a6e3a1] text-[10px] ml-2 bg-[#a6e3a1]/10 px-1.5 py-0.5 rounded">sh -c</span>
          </div>
          <button onClick={onClose} className="text-[#6c7086] hover:text-[#cdd6f4] transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Output area */}
        <div className="flex-1 overflow-y-auto p-md font-mono text-[13px] leading-relaxed min-h-[300px]">
          {history.length === 0 ? (
            <div className="text-[#6c7086] text-sm">
              <p className="mb-1">Connected to container <span className="text-[#cdd6f4] font-bold">{container.name}</span></p>
              <p>Type a command and press Enter. Use ↑↓ for history. Press Esc to close.</p>
            </div>
          ) : (
            history.map((entry, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#a6e3a1]">{container.name}:~$</span>
                  <span className="text-[#cdd6f4]">{entry.cmd}</span>
                </div>
                {entry.error ? (
                  <div className="text-[#f38ba8] pl-4 whitespace-pre-wrap">{entry.error}</div>
                ) : (
                  <>
                    {entry.output && (
                      <div className={`pl-4 whitespace-pre-wrap ${entry.exitCode !== 0 ? "text-[#f38ba8]" : "text-[#cdd6f4]"}`}>
                        {entry.output}
                      </div>
                    )}
                    {entry.exitCode !== null && entry.exitCode !== 0 && (
                      <div className="text-[#f38ba8] text-[11px] pl-4 mt-0.5 opacity-70">exit code: {entry.exitCode}</div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
          {running && (
            <div className="flex items-center gap-2 text-[#6c7086]">
              <span className="text-[#a6e3a1]">{container.name}:~$</span>
              <span className="animate-pulse">running…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#313244] px-md py-sm flex items-center gap-2 shrink-0">
          <span className="text-[#a6e3a1] font-mono text-sm shrink-0">{container.name}:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            placeholder="Type a command… (e.g. ls, ps aux, cat /etc/os-release)"
            className="flex-1 bg-transparent border-none outline-none text-[#cdd6f4] font-mono text-sm placeholder-[#6c7086] disabled:opacity-50"
          />
          <button onClick={runCommand} disabled={running || !input.trim()}
            className="text-[#89dceb] hover:text-white disabled:opacity-30 transition-colors">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ContainersPage() {
  const router = useRouter();
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedContainers, setSelectedContainers] = useState<Set<string>>(new Set());
  const [execContainer, setExecContainer] = useState<any | null>(null);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = await containerService.list();
      setContainers(data);
    } catch {
      setError("Failed to load containers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContainers(); }, []);

  const handleAction = async (action: string, id: string) => {
    try {
      if (action === "start") { await containerService.start(id); await fetchContainers(); }
      else if (action === "stop") { await containerService.stop(id); await fetchContainers(); }
      else if (action === "restart") { await containerService.restart(id); await fetchContainers(); }
      else if (action === "delete") {
        if (confirm("Delete this container?")) { await containerService.delete(id); await fetchContainers(); }
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const filteredContainers = containers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.short_id?.toLowerCase().includes(search.toLowerCase())
  );

  const runningCount = containers.filter(c => c.status === "running").length;

  const toggleSelection = (id: string) => {
    const next = new Set(selectedContainers);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedContainers(next);
  };

  const toggleAll = () => {
    setSelectedContainers(
      selectedContainers.size === filteredContainers.length
        ? new Set()
        : new Set(filteredContainers.map(c => c.id))
    );
  };

  return (
    <>
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface mb-xs">Containers</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and monitor your active container workloads.</p>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={fetchContainers} className="flex items-center gap-xs px-md py-[8px] border border-outline text-on-surface text-sm rounded-lg hover:bg-surface-container-low transition-colors bg-surface">
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>sync</span>
            Refresh
          </button>
          <Link href="/containers/create" className="flex items-center gap-xs px-md py-[8px] bg-primary text-on-primary text-sm rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Container
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl flex-1 flex flex-col overflow-hidden mb-lg shadow-sm">
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-sm">
            <span className="text-xs text-on-surface-variant">{filteredContainers.length} total</span>
            <span className="w-1 h-1 bg-outline rounded-full" />
            <span className="text-xs text-[#00a48d] font-medium">{runningCount} running</span>
            <span className="w-1 h-1 bg-outline rounded-full" />
            <div className="relative">
              <span className="material-symbols-outlined absolute left-1.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[14px]">search</span>
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-6 pr-2 py-0.5 bg-transparent border-b border-outline focus:border-primary outline-none text-sm transition-colors" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          {error ? (
            <div className="p-8 text-center text-error">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-lowest">
                  <th className="py-sm pl-md pr-sm w-[40px]">
                    <input type="checkbox" className="rounded border-outline w-4 h-4 cursor-pointer"
                      checked={selectedContainers.size === filteredContainers.length && filteredContainers.length > 0}
                      onChange={toggleAll} />
                  </th>
                  <th className="py-sm px-sm text-xs text-on-surface-variant uppercase tracking-wider">Name / ID</th>
                  <th className="py-sm px-sm text-xs text-on-surface-variant uppercase tracking-wider">Image</th>
                  <th className="py-sm px-sm text-xs text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-sm px-sm text-xs text-on-surface-variant uppercase tracking-wider">Ports</th>
                  <th className="py-sm px-sm text-xs text-on-surface-variant uppercase tracking-wider">Created</th>
                  <th className="py-sm pr-md pl-sm text-xs text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContainers.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">No containers found.</td></tr>
                ) : (
                  filteredContainers.map(c => {
                    const isRunning = c.status === "running";
                    return (
                      <tr key={c.id} className={`border-b border-outline-variant hover:bg-surface-container-low transition-colors group ${!isRunning ? "opacity-75" : ""}`}>
                        <td className="py-md pl-md pr-sm align-top">
                          <input type="checkbox" className="rounded border-outline w-4 h-4 cursor-pointer mt-0.5"
                            checked={selectedContainers.has(c.id)} onChange={() => toggleSelection(c.id)} />
                        </td>
                        <td className="py-md px-sm align-top">
                          <div className="font-medium text-on-surface text-sm">{c.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono mt-0.5">{c.short_id}</div>
                        </td>
                        <td className="py-md px-sm align-top">
                          <div className="text-sm font-mono text-on-surface-variant">{c.image}</div>
                        </td>
                        <td className="py-md px-sm align-top">
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e6f7f5] text-[#00a48d] text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 bg-[#00a48d] rounded-full animate-pulse" />Running
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 bg-outline rounded-full" />{c.status}
                            </span>
                          )}
                        </td>
                        <td className="py-md px-sm align-top text-sm font-mono text-on-surface-variant">
                          {Object.keys(c.ports || {}).map(k => `${k}→${c.ports[k]?.[0]?.HostPort || "?"}`).join(", ") || "—"}
                        </td>
                        <td className="py-md px-sm align-top text-sm text-on-surface-variant">
                          {new Date(c.created).toLocaleDateString()}
                        </td>
                        <td className="py-md pr-md pl-sm align-top text-right">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Logs */}
                            <Link
                              href={`/logs?container=${c.id}`}
                              className="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors"
                              title="View Logs"
                            >
                              <span className="material-symbols-outlined text-[18px]">terminal</span>
                            </Link>

                            {/* Exec — only for running containers */}
                            {isRunning && (
                              <button
                                onClick={() => setExecContainer(c)}
                                className="p-1.5 text-on-surface-variant hover:bg-[#e6f7f5] hover:text-[#00a48d] rounded-lg transition-colors"
                                title="Open Shell (exec)"
                              >
                                <span className="material-symbols-outlined text-[18px]">code</span>
                              </button>
                            )}

                            {/* Start / Stop */}
                            {isRunning ? (
                              <button onClick={() => handleAction("stop", c.id)}
                                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors" title="Stop">
                                <span className="material-symbols-outlined text-[18px]">stop</span>
                              </button>
                            ) : (
                              <button onClick={() => handleAction("start", c.id)}
                                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-[#00a48d] rounded-lg transition-colors" title="Start">
                                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                              </button>
                            )}

                            {/* Restart */}
                            {isRunning && (
                              <button onClick={() => handleAction("restart", c.id)}
                                className="p-1.5 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors" title="Restart">
                                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                              </button>
                            )}

                            {/* Delete */}
                            <button onClick={() => handleAction("delete", c.id)}
                              className="p-1.5 text-error hover:bg-error-container rounded-lg transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {execContainer && <ExecModal container={execContainer} onClose={() => setExecContainer(null)} />}
    </>
  );
}
