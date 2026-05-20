"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { containerService, imageService, volumeService } from "@/lib/api";

// ─── Image Combobox ───────────────────────────────────────────────────────────
function ImageCombobox({
  value,
  onChange,
  localImages,
}: {
  value: string;
  onChange: (v: string) => void;
  localImages: { id: string; name: string; tag: string; fullTag: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const query = value.toLowerCase();
  const filtered = localImages.filter(
    img =>
      img.name.toLowerCase().includes(query) ||
      img.tag.toLowerCase().includes(query) ||
      img.fullTag.toLowerCase().includes(query)
  );

  // Is the current value exactly matching a local image?
  const isLocal = localImages.some(img => img.fullTag === value);
  const hasInput = value.trim().length > 0;

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center bg-[#F8F9FA] border rounded focus-within:bg-white focus-within:ring-1 transition-colors ${
          isLocal
            ? "border-[#00a48d] focus-within:border-[#00a48d] focus-within:ring-[#00a48d]/30"
            : "border-primary/20 focus-within:border-primary focus-within:ring-primary/20"
        }`}
      >
        <span className="material-symbols-outlined text-on-surface-variant ml-3 text-[18px] shrink-0">
          {isLocal ? "inventory_2" : "cloud_download"}
        </span>
        <input
          id="image-selection"
          type="text"
          placeholder="e.g., nginx:latest"
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none py-2 px-3 font-mono text-sm text-on-surface"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          required
        />
        {hasInput && (
          <span
            className={`mr-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
              isLocal
                ? "bg-[#e6f7f5] text-[#00a48d]"
                : "bg-primary-container text-on-primary-container"
            }`}
          >
            {isLocal ? "local" : "will pull"}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-surface border border-outline-variant rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {/* Local matches */}
          {filtered.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest border-b border-outline-variant">
                Local images
              </div>
              {filtered.map(img => (
                <button
                  key={img.id}
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-surface-container-low transition-colors text-left"
                  onClick={() => { onChange(img.fullTag); setOpen(false); }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[#00a48d] text-[16px] shrink-0">inventory_2</span>
                    <span className="font-mono text-sm text-on-surface truncate">{img.name}</span>
                    <span className="text-xs font-mono bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded shrink-0">
                      {img.tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono ml-2 shrink-0">local</span>
                </button>
              ))}
            </>
          )}

          {/* Type-to-pull option */}
          {hasInput && !isLocal && (
            <>
              {filtered.length > 0 && <div className="border-t border-outline-variant" />}
              <div className="px-3 py-1.5 text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest border-b border-outline-variant">
                Pull from registry
              </div>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low transition-colors text-left"
                onClick={() => { setOpen(false); }}
              >
                <span className="material-symbols-outlined text-primary text-[16px]">cloud_download</span>
                <span className="font-mono text-sm text-on-surface">{value}</span>
                <span className="text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded ml-auto shrink-0">
                  will pull
                </span>
              </button>
            </>
          )}

          {!hasInput && filtered.length === 0 && (
            <div className="px-3 py-4 text-sm text-center text-on-surface-variant">
              Start typing an image name…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateContainerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [containerPort, setContainerPort] = useState("");
  const [hostPort, setHostPort] = useState("");
  const [hostVolume, setHostVolume] = useState("");
  const [containerVolume, setContainerVolume] = useState("");
  const [availableVolumes, setAvailableVolumes] = useState<any[]>([]);
  const [localImages, setLocalImages] = useState<
    { id: string; name: string; tag: string; fullTag: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ step: string; detail?: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    volumeService.list().then(setAvailableVolumes).catch(() => {});
    imageService.list().then((imgs: any[]) => {
      const parsed = imgs.flatMap(img => {
        if (!img.tags || img.tags.length === 0) return [];
        return img.tags.map((t: string) => {
          const [n, tag] = t.split(":");
          return { id: img.id, name: n, tag: tag || "latest", fullTag: t };
        });
      });
      setLocalImages(parsed);
    }).catch(() => {});
  }, []);

  const isImageLocal = localImages.some(img => img.fullTag === image.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      // Pull image first if it's not local
      if (!isImageLocal) {
        setStatus({ step: "Pulling image…", detail: image.trim() });
        try {
          await imageService.pull(image.trim());
        } catch (err: any) {
          throw new Error(`Failed to pull image: ${err.message}`);
        }
      }

      setStatus({ step: "Creating container…" });

      let ports = undefined;
      if (containerPort && hostPort) {
        ports = { [`${containerPort}/tcp`]: parseInt(hostPort, 10) || hostPort };
      }

      let volumes = undefined;
      if (hostVolume && containerVolume) {
        volumes = { [hostVolume]: { bind: containerVolume, mode: "rw" } };
      }

      await containerService.create({ name, image: image.trim(), ports, volumes });
      setStatus({ step: "Done! Redirecting…" });
      setTimeout(() => router.push("/containers"), 600);
    } catch (err: any) {
      setFormError(err.message || "Deployment failed");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[#F8F9FA] border border-primary/20 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 py-2 px-3 text-sm text-on-surface transition-colors outline-none";

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-xl flex items-center gap-md">
        <button
          type="button"
          onClick={() => router.push("/containers")}
          className="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline-md text-headline-md font-semibold text-on-surface">Deploy Container</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure and launch a new container instance.</p>
        </div>
      </div>

      {/* Error banner */}
      {formError && (
        <div className="mb-lg bg-error-container border border-error rounded-xl p-md flex items-center gap-3 text-on-error-container text-sm">
          <span className="material-symbols-outlined text-error shrink-0">error</span>
          <span className="flex-1">{formError}</span>
          <button onClick={() => setFormError(null)}>
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-xl max-w-3xl">
        {/* ── General ── */}
        <div className="bg-surface rounded-xl border border-outline-variant p-lg shadow-sm">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-lg flex items-center gap-sm border-b border-outline-variant pb-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">settings</span>
            General
          </h2>
          <div className="space-y-lg">
            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-xs" htmlFor="container-name">
                Container Name
              </label>
              <input
                id="container-name"
                type="text"
                placeholder="e.g., web-server-prod"
                className={inputClass}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-on-surface-variant uppercase tracking-wider mb-xs" htmlFor="image-selection">
                Image
              </label>
              <ImageCombobox value={image} onChange={setImage} localImages={localImages} />
              <p className="mt-1.5 text-xs text-on-surface-variant ml-1">
                {isImageLocal
                  ? "✓ Found in local inventory — no pull needed"
                  : image.trim()
                  ? "Image not found locally — will be pulled from Docker Hub on deploy"
                  : "Type to search local images or enter a registry image name"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Port Mapping ── */}
        <div className="bg-surface rounded-xl border border-outline-variant p-lg shadow-sm">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-lg flex items-center gap-sm border-b border-outline-variant pb-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">router</span>
            Port Mapping <span className="text-xs text-on-surface-variant font-normal ml-1">(optional)</span>
          </h2>
          <div className="flex items-stretch gap-0 rounded-lg border border-outline-variant overflow-hidden">
            {/* Host side */}
            <div className="flex-1 p-md bg-surface-container-lowest">
              <div className="flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[14px] text-primary">computer</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Your Machine</span>
              </div>
              <label className="block text-xs text-on-surface-variant mb-1" htmlFor="host-port">Host Port</label>
              <input
                id="host-port"
                type="text"
                placeholder="8080"
                className={inputClass + " font-mono text-center text-base"}
                value={hostPort}
                onChange={e => setHostPort(e.target.value)}
              />
              <p className="text-[10px] text-on-surface-variant mt-1 text-center">Accessible from your browser</p>
            </div>
            {/* Connector */}
            <div className="flex flex-col items-center justify-center px-3 bg-surface-container-low border-x border-outline-variant min-w-[56px]">
              <span className="material-symbols-outlined text-outline text-[20px]">arrow_forward</span>
              <span className="text-[9px] text-on-surface-variant mt-1 uppercase tracking-wider">maps to</span>
            </div>
            {/* Container side */}
            <div className="flex-1 p-md bg-surface-container-lowest">
              <div className="flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[14px] text-primary">view_in_ar</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Container</span>
              </div>
              <label className="block text-xs text-on-surface-variant mb-1" htmlFor="container-port">Container Port</label>
              <input
                id="container-port"
                type="text"
                placeholder="80"
                className={inputClass + " font-mono text-center text-base"}
                value={containerPort}
                onChange={e => setContainerPort(e.target.value)}
              />
              <p className="text-[10px] text-on-surface-variant mt-1 text-center">Port the app listens on</p>
            </div>
          </div>
          {hostPort && containerPort && (
            <p className="mt-sm text-xs text-on-surface-variant font-mono text-center">
              localhost:<span className="text-primary font-bold">{hostPort}</span> → container:<span className="text-primary font-bold">{containerPort}</span>
            </p>
          )}
        </div>

        {/* ── Volumes ── */}
        <div className="bg-surface rounded-xl border border-outline-variant p-lg shadow-sm">
          <h2 className="font-title-sm text-title-sm text-on-surface mb-lg flex items-center gap-sm border-b border-outline-variant pb-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">hard_drive</span>
            Volume Mount <span className="text-xs text-on-surface-variant font-normal ml-1">(optional)</span>
          </h2>
          <div className="flex items-stretch gap-0 rounded-lg border border-outline-variant overflow-hidden">
            {/* Volume side */}
            <div className="flex-1 p-md bg-surface-container-lowest">
              <div className="flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[14px] text-primary">hard_drive</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Docker Volume</span>
              </div>
              <label className="block text-xs text-on-surface-variant mb-1">Select Volume</label>
              <div className="relative">
                <select
                  className={inputClass + " appearance-none pr-8"}
                  value={hostVolume}
                  onChange={e => setHostVolume(e.target.value)}
                >
                  <option value="">Select volume…</option>
                  {availableVolumes.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
                  arrow_drop_down
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1 text-center">Persistent storage on host</p>
            </div>
            {/* Connector */}
            <div className="flex flex-col items-center justify-center px-3 bg-surface-container-low border-x border-outline-variant min-w-[56px]">
              <span className="material-symbols-outlined text-outline text-[20px]">arrow_forward</span>
              <span className="text-[9px] text-on-surface-variant mt-1 uppercase tracking-wider">mounts at</span>
            </div>
            {/* Mount path side */}
            <div className="flex-1 p-md bg-surface-container-lowest">
              <div className="flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[14px] text-primary">folder_open</span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Container Path</span>
              </div>
              <label className="block text-xs text-on-surface-variant mb-1">Mount Path</label>
              <input
                type="text"
                placeholder="/data"
                className={inputClass + " font-mono"}
                value={containerVolume}
                onChange={e => setContainerVolume(e.target.value)}
              />
              <p className="text-[10px] text-on-surface-variant mt-1 text-center">Path inside the container</p>
            </div>
          </div>
          {hostVolume && containerVolume && (
            <p className="mt-sm text-xs text-on-surface-variant font-mono text-center">
              <span className="text-primary font-bold">{hostVolume}</span> → <span className="text-primary font-bold">{containerVolume}</span>
            </p>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="flex justify-end gap-md pt-sm">
          <button
            type="button"
            onClick={() => router.push("/containers")}
            className="px-xl py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-xl py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-60 flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                {status?.step || "Working…"}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                {isImageLocal ? "Deploy" : "Pull & Deploy"}
              </>
            )}
          </button>
        </div>

        {/* Inline status during deploy */}
        {loading && status && (
          <div className="flex items-center gap-3 text-sm text-on-surface-variant bg-surface-container-low border border-outline-variant rounded-xl px-md py-sm">
            <span className="material-symbols-outlined animate-spin text-primary text-[18px]">refresh</span>
            <div>
              <span className="font-medium text-on-surface">{status.step}</span>
              {status.detail && <span className="ml-2 font-mono text-xs">{status.detail}</span>}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
