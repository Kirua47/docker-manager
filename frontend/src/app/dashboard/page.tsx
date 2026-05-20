"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { containerService, systemService } from "@/lib/api";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell,
  CartesianGrid, Legend
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SystemStats {
  active: number;
  stopped: number;
  totalImages: number;
  cpu: number;
  usedMemory: number;
  totalMemory: number;
  os: string;
  kernel: string;
  serverVersion: string;
  ncpu: number;
  totalVolumes: number;
  totalNetworks: number;
  networkRx: number;
  networkTx: number;
  blockRead: number;
  blockWrite: number;
  perContainer: { name: string; short_id: string; memory: number; cpu: number; net_rx: number; net_tx: number; blk_read: number; blk_write: number }[];
}

interface HistoryPoint {
  time: string;
  cpu: number;
  mem: number;
  rx: number;
  tx: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function timeLabel() {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ title, icon, value, sub, accent = "text-primary" }: {
  title: string; icon: string; value: React.ReactNode; sub?: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-lg hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-md">
        <span className="font-title-sm text-title-sm text-on-surface-variant">{title}</span>
        <span className={`material-symbols-outlined ${accent}`}>{icon}</span>
      </div>
      <div className="font-display-lg text-display-lg text-on-surface mb-xs">{value}</div>
      {sub && <div className="text-xs text-on-surface-variant">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, icon, children, className = "" }: {
  title: string; icon: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-surface border border-outline-variant rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-sm px-lg py-sm border-b border-outline-variant bg-surface-container-lowest">
        <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
        <span className="font-title-sm text-title-sm text-on-surface">{title}</span>
      </div>
      <div className="p-lg">{children}</div>
    </div>
  );
}

const CHART_COLORS = { cpu: "#2496ed", mem: "#00a48d", rx: "#7c3aed", tx: "#d97706" };
const PIE_COLORS = ["#2496ed", "#e8eaed"];

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-sm shadow-lg text-xs">
      <p className="text-on-surface-variant mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats>({
    active: 0, stopped: 0, totalImages: 0, cpu: 0,
    usedMemory: 0, totalMemory: 0, os: "", kernel: "",
    serverVersion: "", ncpu: 0, totalVolumes: 0, totalNetworks: 0,
    networkRx: 0, networkTx: 0, blockRead: 0, blockWrite: 0, perContainer: [],
  });
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [recentContainers, setRecentContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const POLL_MS = 8000;
  const HISTORY_MAX = 15;

  const fetchContainers = useCallback(async () => {
    try {
      const data = await containerService.list();
      setRecentContainers(data.slice(0, 6));
    } catch {}
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await systemService.getStats();
      setError(null);
      setStats({
        active: data.active_containers,
        stopped: data.total_containers - data.active_containers,
        totalImages: data.total_images,
        cpu: data.cpu_usage_percent,
        usedMemory: data.used_memory,
        totalMemory: data.total_memory,
        os: data.os,
        kernel: data.kernel,
        serverVersion: data.server_version,
        ncpu: data.ncpu,
        totalVolumes: data.total_volumes,
        totalNetworks: data.total_networks,
        networkRx: data.network_rx,
        networkTx: data.network_tx,
        blockRead: data.block_read,
        blockWrite: data.block_write,
        perContainer: data.per_container_stats || [],
      });

      const memPercent = data.total_memory > 0
        ? parseFloat(((data.used_memory / data.total_memory) * 100).toFixed(1))
        : 0;

      setHistory(prev => {
        const next = [...prev, {
          time: timeLabel(),
          cpu: parseFloat(data.cpu_usage_percent.toFixed(1)),
          mem: memPercent,
          rx: data.network_rx,
          tx: data.network_tx,
        }];
        if (next.length > HISTORY_MAX) next.shift();
        return next;
      });

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || "Failed to fetch system stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchContainers();
    const statsInterval = setInterval(fetchStats, POLL_MS);
    const containerInterval = setInterval(fetchContainers, 10000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(containerInterval);
    };
  }, [fetchStats, fetchContainers]);

  const memPercent = stats.totalMemory > 0
    ? ((stats.usedMemory / stats.totalMemory) * 100).toFixed(1)
    : "0";

  const memPieData = [
    { name: "Used", value: stats.usedMemory },
    { name: "Free", value: Math.max(0, stats.totalMemory - stats.usedMemory) },
  ];

  const containerMemData = stats.perContainer
    .sort((a, b) => b.memory - a.memory)
    .slice(0, 8)
    .map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + "…" : c.name,
      memory: parseFloat((c.memory / (1024 * 1024)).toFixed(1)),
      cpu: c.cpu,
    }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-on-surface-variant gap-4">
        <span className="material-symbols-outlined animate-spin text-5xl opacity-40">refresh</span>
        <p className="text-sm">Fetching live system data…</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-xl gap-md">
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface mb-xs">System Dashboard</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time telemetry from the Docker daemon
            {lastUpdated && <span className="ml-2 text-xs opacity-60">· updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          {error ? (
            <div className="flex items-center gap-sm bg-error-container border border-error px-md py-sm rounded-lg text-on-error-container text-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          ) : (
            <div className="flex items-center gap-sm bg-surface-container-low border border-outline-variant px-md py-sm rounded-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a48d] shadow-[0_0_8px_rgba(0,164,141,0.6)] animate-pulse" />
              <span className="font-title-sm text-title-sm text-on-surface">Live · {POLL_MS / 1000}s</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <StatCard
          title="Active Containers"
          icon="view_in_ar"
          value={stats.active}
          sub={`${stats.stopped} stopped · ${stats.active + stats.stopped} total`}
          accent="text-primary"
        />
        <StatCard
          title="Docker Images"
          icon="layers"
          value={stats.totalImages}
          sub={`${stats.totalVolumes} volumes · ${stats.totalNetworks} networks`}
          accent="text-primary"
        />
        <StatCard
          title="CPU Usage"
          icon="memory"
          value={`${stats.cpu.toFixed(1)}%`}
          sub={`${stats.ncpu} logical cores available`}
          accent={stats.cpu > 70 ? "text-error" : stats.cpu > 40 ? "text-secondary" : "text-primary"}
        />
        <StatCard
          title="Memory"
          icon="speed"
          value={`${memPercent}%`}
          sub={`${formatBytes(stats.usedMemory)} / ${formatBytes(stats.totalMemory)}`}
          accent={parseFloat(memPercent) > 80 ? "text-error" : parseFloat(memPercent) > 60 ? "text-secondary" : "text-primary"}
        />
      </div>

      {/* ── Row 2: CPU + Memory history charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        <SectionCard title="CPU History" icon="query_stats">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.cpu} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.cpu} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip formatter={(v: number) => `${v}%`} />} />
                <Area type="monotone" dataKey="cpu" name="CPU" stroke={CHART_COLORS.cpu} strokeWidth={2} fill="url(#gCpu)" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Memory History" icon="monitoring">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.mem} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.mem} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} unit="%" />
                <Tooltip content={<CustomTooltip formatter={(v: number) => `${v}%`} />} />
                <Area type="monotone" dataKey="mem" name="Memory" stroke={CHART_COLORS.mem} strokeWidth={2} fill="url(#gMem)" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: Network + Per-Container breakdown + Memory Pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
        {/* Network history */}
        <div className="lg:col-span-2">
          <SectionCard title="Network I/O History" icon="swap_vert">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.rx} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_COLORS.rx} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gTx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.tx} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={CHART_COLORS.tx} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} tickFormatter={(v) => formatBytes(v, 0)} />
                  <Tooltip content={<CustomTooltip formatter={(v: number) => formatBytes(v)} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="rx" name="RX" stroke={CHART_COLORS.rx} strokeWidth={2} fill="url(#gRx)" isAnimationActive={false} dot={false} />
                  <Area type="monotone" dataKey="tx" name="TX" stroke={CHART_COLORS.tx} strokeWidth={2} fill="url(#gTx)" isAnimationActive={false} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Memory Donut */}
        <SectionCard title="Memory Breakdown" icon="pie_chart">
          <div className="flex flex-col items-center">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={memPieData} innerRadius={46} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none" isAnimationActive={false}>
                    {memPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatBytes(v as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-sm space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" />Used</span>
                <span className="font-medium text-on-surface">{formatBytes(stats.usedMemory)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-container-high inline-block" />Free</span>
                <span className="font-medium text-on-surface">{formatBytes(Math.max(0, stats.totalMemory - stats.usedMemory))}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-outline-variant pt-1 mt-1">
                <span className="text-on-surface-variant">Total</span>
                <span className="font-medium text-on-surface">{formatBytes(stats.totalMemory)}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Row 4: Per-Container Memory Bar + Block I/O + Host Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
        {/* Per-container memory */}
        <div className="lg:col-span-2">
          <SectionCard title="Memory per Container (MB)" icon="bar_chart">
            {containerMemData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-on-surface-variant text-sm">
                No running containers
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={containerMemData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} unit=" MB" />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: "#8c9196" }} tickLine={false} />
                    <Tooltip formatter={(v: any) => `${v} MB`} />
                    <Bar dataKey="memory" name="Memory" fill="#2496ed" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Block I/O + Host Info */}
        <div className="flex flex-col gap-lg">
          <SectionCard title="Block I/O" icon="hard_drive">
            <div className="space-y-md">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-xs text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[15px] text-[#00a48d]">read_more</span> Read
                </span>
                <span className="font-medium text-on-surface text-sm">{formatBytes(stats.blockRead)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-xs text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-[15px] text-primary">drive_file_rename_outline</span> Write
                </span>
                <span className="font-medium text-on-surface text-sm">{formatBytes(stats.blockWrite)}</span>
              </div>
              <div className="border-t border-outline-variant pt-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-xs text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[15px] text-secondary">arrow_downward</span> Net RX
                  </span>
                  <span className="font-medium text-on-surface text-sm">{formatBytes(stats.networkRx)}</span>
                </div>
                <div className="flex justify-between items-center mt-sm">
                  <span className="flex items-center gap-xs text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[15px] text-primary">arrow_upward</span> Net TX
                  </span>
                  <span className="font-medium text-on-surface text-sm">{formatBytes(stats.networkTx)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Host Info" icon="dns">
            <div className="space-y-sm">
              {[
                { label: "OS", value: stats.os || "Unknown" },
                { label: "Kernel", value: stats.kernel || "Unknown" },
                { label: "Docker", value: `v${stats.serverVersion || "?"}` },
                { label: "Cores", value: `${stats.ncpu || 0} vCPUs` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start text-sm">
                  <span className="text-on-surface-variant shrink-0 mr-2">{label}</span>
                  <span className="font-medium text-on-surface text-right truncate" title={value}>{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* ── Row 5: Quick Actions + Recent Containers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="bg-surface border border-outline-variant rounded-xl p-lg">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-md">Quick Actions</h2>
          <div className="flex flex-col gap-sm">
            <Link href="/containers/create" id="dash-deploy-btn" className="flex items-center justify-between w-full bg-primary text-on-primary px-md py-sm rounded-lg hover:opacity-90 transition-all active:scale-95">
              <span className="font-title-sm text-title-sm">Deploy Container</span>
              <span className="material-symbols-outlined text-[20px]">add</span>
            </Link>
            <Link href="/images" id="dash-pull-btn" className="flex items-center justify-between w-full border border-outline-variant text-on-surface px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="font-title-sm text-title-sm">Pull Image</span>
              <span className="material-symbols-outlined text-[20px]">download</span>
            </Link>
            <Link href="/volumes" id="dash-volumes-btn" className="flex items-center justify-between w-full border border-outline-variant text-on-surface px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="font-title-sm text-title-sm">Manage Volumes</span>
              <span className="material-symbols-outlined text-[20px]">folder_open</span>
            </Link>
            <Link href="/logs" id="dash-logs-btn" className="flex items-center justify-between w-full border border-outline-variant text-on-surface px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="font-title-sm text-title-sm">View Logs</span>
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="px-lg py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">view_in_ar</span>
              <span className="font-title-sm text-title-sm text-on-surface">Recent Containers</span>
            </div>
            <Link href="/containers" className="text-primary hover:opacity-80 font-title-sm text-title-sm transition-opacity text-sm">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-lg py-sm text-xs text-on-surface-variant uppercase tracking-wider">Name</th>
                  <th className="px-lg py-sm text-xs text-on-surface-variant uppercase tracking-wider">ID</th>
                  <th className="px-lg py-sm text-xs text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-lg py-sm text-xs text-on-surface-variant uppercase tracking-wider">Image</th>
                  <th className="px-lg py-sm text-xs text-on-surface-variant uppercase tracking-wider">Ports</th>
                </tr>
              </thead>
              <tbody>
                {recentContainers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-lg py-8 text-center text-on-surface-variant text-sm">
                      No containers found.
                    </td>
                  </tr>
                ) : (
                  recentContainers.map((c: any, i: number) => {
                    const isRunning = c.status === "running";
                    return (
                      <tr key={i} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-sm text-sm text-on-surface font-medium max-w-[120px] truncate">{c.name}</td>
                        <td className="px-lg py-sm text-xs text-on-surface-variant font-mono">{c.short_id}</td>
                        <td className="px-lg py-sm">
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1 text-[#00a48d] bg-[#e6f7f5] px-2 py-0.5 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00a48d] animate-pulse" /> Running
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline" /> {c.status}
                            </span>
                          )}
                        </td>
                        <td className="px-lg py-sm text-xs text-on-surface-variant font-mono max-w-[120px] truncate">{c.image}</td>
                        <td className="px-lg py-sm text-xs text-on-surface-variant font-mono">
                          {Object.keys(c.ports || {}).length > 0
                            ? Object.keys(c.ports).map(k => `${k}→${c.ports[k]?.[0]?.HostPort || "?"}`).join(" ")
                            : "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
