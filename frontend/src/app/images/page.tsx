"use client";

import { useState, useEffect } from "react";
import { imageService } from "@/lib/api";

export default function ImagesPage() {
  const [search, setSearch] = useState("");
  const [pullImageName, setPullImageName] = useState("");
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [pullSuccess, setPullSuccess] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<{ id: string; msg: string } | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await imageService.list();
      setImages(data);
    } catch {
      setError("Failed to load images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handlePull = async () => {
    if (!pullImageName.trim()) return;
    setIsPulling(true);
    setPullSuccess("");
    try {
      await imageService.pull(pullImageName.trim());
      setPullSuccess(`✓ Pulled "${pullImageName.trim()}" successfully`);
      setPullImageName("");
      await fetchImages();
    } catch (err: any) {
      setDeleteError({ id: "pull", msg: err.message || "Failed to pull image" });
    } finally {
      setIsPulling(false);
      setTimeout(() => setPullSuccess(""), 4000);
    }
  };

  // Delete a single image — if it fails with "in use", offer force delete
  const handleDelete = async (id: string, force = false) => {
    setDeletingIds(prev => new Set(prev).add(id));
    setDeleteError(null);
    try {
      await imageService.delete(id, force);
      setSelectedImages(prev => { const n = new Set(prev); n.delete(id); return n; });
      await fetchImages();
    } catch (err: any) {
      setDeleteError({ id, msg: err.message || "Failed to delete image" });
    } finally {
      setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  // Bulk delete — collect errors but keep going
  const handleBulkDelete = async (force = false) => {
    const ids = Array.from(selectedImages);
    let failed: string[] = [];
    for (const id of ids) {
      setDeletingIds(prev => new Set(prev).add(id));
      try {
        await imageService.delete(id, force);
      } catch (err: any) {
        failed.push(err.message);
      } finally {
        setDeletingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      }
    }
    setSelectedImages(new Set());
    await fetchImages();
    if (failed.length) {
      setDeleteError({ id: "bulk", msg: failed.join(" | ") });
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "Unknown";
    return new Date(isoString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const parseTag = (tags: string[]) => {
    if (!tags || tags.length === 0) return { name: "<none>", tag: "<none>" };
    const [name, tag] = tags[0].split(":");
    return { name: name || "<none>", tag: tag || "latest" };
  };

  const parseId = (id: string) => id.replace("sha256:", "").substring(0, 12);

  const filteredImages = images.filter(img => {
    const { name, tag } = parseTag(img.tags);
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      tag.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedImages);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedImages(next);
  };

  const toggleAll = () => {
    setSelectedImages(
      selectedImages.size === filteredImages.length && filteredImages.length > 0
        ? new Set()
        : new Set(filteredImages.map(i => i.id))
    );
  };

  const isInUseError = (msg: string) =>
    msg.toLowerCase().includes("in use") || msg.toLowerCase().includes("conflict");

  return (
    <div className="flex flex-col gap-lg animate-in fade-in duration-700">
      <div>
        <h1 className="font-headline-md text-headline-md font-semibold text-on-surface mb-xs">Image Inventory</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Manage local images and pull from registries.</p>
      </div>

      {/* ── Pull card ── */}
      <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-sm shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-secondary-container/30 to-transparent pointer-events-none" />
        <h2 className="font-title-sm text-title-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">cloud_download</span>
          Pull Remote Image
        </h2>
        <div className="flex gap-md mt-1 relative z-10">
          <div className="relative flex-1 flex items-center bg-surface-container-low border border-outline-variant rounded-lg focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all h-10">
            <span className="material-symbols-outlined text-on-surface-variant ml-3 text-[16px]">terminal</span>
            <input
              id="pull-image-input"
              type="text"
              placeholder="e.g., nginx:latest or redis:7.0-alpine"
              className="w-full h-full bg-transparent border-none outline-none text-sm text-on-surface px-3 placeholder-outline"
              value={pullImageName}
              onChange={e => setPullImageName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePull()}
            />
          </div>
          <button
            id="pull-image-btn"
            onClick={handlePull}
            disabled={isPulling || !pullImageName.trim()}
            className="bg-primary text-on-primary font-title-sm text-title-sm px-6 h-10 rounded-lg hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-50 flex items-center gap-2 active:scale-95"
          >
            {isPulling ? <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span> : <span className="material-symbols-outlined text-[16px]">download</span>}
            {isPulling ? "Pulling…" : "Pull"}
          </button>
        </div>
        {pullSuccess && (
          <p className="text-sm text-[#00a48d] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span> {pullSuccess}
          </p>
        )}
        {deleteError?.id === "pull" && (
          <p className="text-sm text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">error</span> {deleteError.msg}
          </p>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant ml-8">Defaults to Docker Hub if no registry prefix is provided.</p>
      </div>

      {/* ── Error banner ── */}
      {deleteError && deleteError.id !== "pull" && (
        <div className="bg-error-container border border-error rounded-xl p-md flex items-start gap-3">
          <span className="material-symbols-outlined text-error shrink-0">error</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-on-error-container">{deleteError.msg}</p>
            {isInUseError(deleteError.msg) && deleteError.id !== "bulk" && (
              <p className="text-xs text-on-error-container/80 mt-1">
                This image is used by a container.{" "}
                <button
                  onClick={() => handleDelete(deleteError.id, true)}
                  className="underline font-semibold hover:no-underline"
                >
                  Force delete anyway
                </button>
              </p>
            )}
            {isInUseError(deleteError.msg) && deleteError.id === "bulk" && (
              <p className="text-xs text-on-error-container/80 mt-1">
                Some images are in use.{" "}
                <button
                  onClick={() => handleBulkDelete(true)}
                  className="underline font-semibold hover:no-underline"
                >
                  Force delete all selected
                </button>
              </p>
            )}
          </div>
          <button onClick={() => setDeleteError(null)} className="text-on-error-container/60 hover:text-on-error-container">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ── Image table ── */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <div className="flex items-center gap-md">
            <h2 className="font-title-sm text-title-sm text-on-surface">Local Storage</h2>
            <span className="bg-surface-container text-on-surface-variant text-xs px-2 py-0.5 rounded-full">
              {filteredImages.length} images
            </span>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-[15px]">search</span>
              <input
                id="image-search-input"
                type="text"
                placeholder="Filter images…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          {selectedImages.size > 0 && (
            <div className="flex items-center gap-sm">
              <span className="text-sm text-on-surface-variant">{selectedImages.size} selected</span>
              <button
                id="bulk-delete-btn"
                onClick={() => handleBulkDelete(false)}
                disabled={deletingIds.size > 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-error-container text-error rounded-lg hover:bg-error hover:text-on-error transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading && images.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-4xl opacity-40">refresh</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-error">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-lowest">
                  <th className="py-3 px-md w-10">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant w-4 h-4"
                      checked={selectedImages.size === filteredImages.length && filteredImages.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider">Repository</th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider">Tag</th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider">Image ID</th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider">Created</th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider">Size</th>
                  <th className="py-3 px-md text-xs text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredImages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-on-surface-variant text-sm">
                      {search ? "No images match your filter." : "No local images found."}
                    </td>
                  </tr>
                ) : (
                  filteredImages.map(image => {
                    const { name, tag } = parseTag(image.tags);
                    const isDangling = name === "<none>";
                    const isDeleting = deletingIds.has(image.id);
                    return (
                      <tr
                        key={image.id}
                        className={`hover:bg-surface-container-low transition-colors group ${isDeleting ? "opacity-50" : ""}`}
                      >
                        <td className="py-3 px-md">
                          <input
                            type="checkbox"
                            className="rounded border-outline-variant w-4 h-4"
                            checked={selectedImages.has(image.id)}
                            onChange={() => toggleSelection(image.id)}
                            disabled={isDeleting}
                          />
                        </td>
                        <td className={`py-3 px-md text-sm font-medium ${isDangling ? "text-on-surface-variant italic" : "text-primary"}`}>
                          {name}
                        </td>
                        <td className="py-3 px-md">
                          <span className={`text-xs px-2 py-0.5 rounded border font-mono ${isDangling ? "bg-surface-container text-on-surface-variant border-outline-variant border-dashed" : "bg-secondary-container text-on-secondary-container border-secondary-fixed"}`}>
                            {tag}
                          </span>
                        </td>
                        <td className="py-3 px-md text-xs text-on-surface-variant font-mono">{parseId(image.id)}</td>
                        <td className="py-3 px-md text-sm text-on-surface-variant">{formatDate(image.created)}</td>
                        <td className="py-3 px-md text-sm text-on-surface-variant font-mono">{formatSize(image.size)}</td>
                        <td className="py-3 px-md text-right">
                          <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isDeleting ? (
                              <span className="material-symbols-outlined animate-spin text-on-surface-variant text-[18px]">refresh</span>
                            ) : (
                              <button
                                id={`delete-image-${parseId(image.id)}`}
                                onClick={() => handleDelete(image.id, false)}
                                className="text-error hover:text-on-error p-1.5 rounded-lg hover:bg-error transition-colors"
                                title="Delete image"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
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
    </div>
  );
}
