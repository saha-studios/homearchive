"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type Memory = {
  id: string;
  title: string;
  year: number;
  location: string | null;
};

type Photo = {
  id: number;
  memory_id: string | null;
  image_url: string;
  caption: string | null;
  created_at: string;
};

type FilterType = "all" | "attached" | "unattached" | string;

const PAGE_SIZE = 48;

function getStoragePath(imageUrl: string) {
  const marker =
    "/storage/v1/object/public/archive-photos/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl.substring(index + marker.length)
  );
}

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Unknown date";
  }

  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function GalleryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);

  const [selectedPhoto, setSelectedPhoto] =
    useState<Photo | null>(null);

  const [attachMemoryId, setAttachMemoryId] =
    useState("");

  const [attaching, setAttaching] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] = useState("");

  async function loadMemories() {
    const { data, error } = await supabase
      .from("memories")
      .select("id,title,year,location")
      .order("year", { ascending: false });

    if (error) {
      console.error("MEMORY LOAD ERROR:", error);
      return;
    }

    setMemories(data ?? []);
  }

  async function fetchPhotos(
    filter: FilterType,
    from: number,
    to: number
  ) {
    let query = supabase
      .from("memory_photos")
      .select(
        "id,memory_id,image_url,caption,created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .range(from, to);

    if (filter === "attached") {
      query = query.not("memory_id", "is", null);
    } else if (filter === "unattached") {
      query = query.is("memory_id", null);
    } else if (
      filter !== "all"
    ) {
      query = query.eq("memory_id", filter);
    }

    return query;
  }

  async function loadGallery(
    filter: FilterType = selectedFilter
  ) {
    setLoading(true);
    setMessage("");
    setSelectedPhoto(null);

    const { data, error } = await fetchPhotos(
      filter,
      0,
      PAGE_SIZE - 1
    );

    if (error) {
      console.error(
        "PHOTO LOAD ERROR:",
        error
      );

      setMessage(
        `Could not load photos: ${error.message}`
      );

      setPhotos([]);
      setHasMore(false);
    } else {
      setPhotos(data ?? []);
      setHasMore(
        (data?.length ?? 0) === PAGE_SIZE
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadMemories();
    loadGallery("all");
  }, []);

  const memoryMap = useMemo(() => {
    const map = new Map<string, Memory>();

    for (const memory of memories) {
      map.set(memory.id, memory);
    }

    return map;
  }, [memories]);

  function getMemory(photo: Photo) {
    if (!photo.memory_id) {
      return null;
    }

    return memoryMap.get(photo.memory_id) ?? null;
  }

  function handleFilterChange(value: string) {
    setSelectedFilter(value);
    loadGallery(value);
  }

  async function loadMore() {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);

    const from = photos.length;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await fetchPhotos(
      selectedFilter,
      from,
      to
    );

    if (error) {
      console.error(
        "LOAD MORE ERROR:",
        error
      );

      setMessage(
        `Could not load more photos: ${error.message}`
      );
    } else {
      const newPhotos = data ?? [];

      setPhotos((current) => [
        ...current,
        ...newPhotos,
      ]);

      setHasMore(
        newPhotos.length === PAGE_SIZE
      );
    }

    setLoadingMore(false);
  }

  async function attachPhotoToMemory() {
    if (
      !selectedPhoto ||
      !attachMemoryId
    ) {
      return;
    }

    setAttaching(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("memory_photos")
        .update({
          memory_id: attachMemoryId,
        })
        .eq("id", selectedPhoto.id);

      if (error) {
        throw error;
      }

      const updatedPhoto = {
        ...selectedPhoto,
        memory_id: attachMemoryId,
      };

      setPhotos((current) =>
        current.map((photo) =>
          photo.id === selectedPhoto.id
            ? updatedPhoto
            : photo
        )
      );

      setSelectedPhoto(updatedPhoto);
      setAttachMemoryId("");

      const memory =
        memoryMap.get(attachMemoryId);

      setMessage(
        `Photo attached to ${
          memory?.title ?? "the memory"
        }.`
      );

      /*
       * If we are currently viewing unattached
       * photos, remove the photo from that view.
       */
      if (
        selectedFilter === "unattached"
      ) {
        setPhotos((current) =>
          current.filter(
            (photo) =>
              photo.id !== selectedPhoto.id
          )
        );

        setSelectedPhoto(null);
      }
    } catch (error) {
      console.error(
        "ATTACH PHOTO ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? `Could not attach photo: ${error.message}`
          : "Could not attach photo."
      );
    } finally {
      setAttaching(false);
    }
  }

  async function deletePhoto(photo: Photo) {
    const confirmed =
      window.confirm(
        "Delete this photo permanently?\n\nThis will remove it from the archive and delete the stored image."
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const storagePath =
        getStoragePath(
          photo.image_url
        );

      /*
       * Remove the actual image from
       * Supabase Storage first.
       */
      if (storagePath) {
        const { error: storageError } =
          await supabase.storage
            .from("archive-photos")
            .remove([storagePath]);

        if (storageError) {
          console.warn(
            "Storage delete warning:",
            storageError.message
          );
        }
      }

      /*
       * Then remove the database record.
       */
      const { error } =
        await supabase
          .from("memory_photos")
          .delete()
          .eq("id", photo.id);

      if (error) {
        throw error;
      }

      setPhotos((current) =>
        current.filter(
          (item) => item.id !== photo.id
        )
      );

      setSelectedPhoto(null);

      setMessage(
        "Photo deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE PHOTO ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? `Could not delete photo: ${error.message}`
          : "Could not delete photo."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#03150b] px-4 pb-24 pt-28 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-green-400">
              Home Archive
            </p>

            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  Photo Archive
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-green-100/60 sm:text-base">
                  Explore the photos collected throughout
                  the history of the home.
                </p>
              </div>

              <div className="text-sm text-green-100/50">
                {photos.length}
                {hasMore ? "+" : ""} loaded
              </div>
            </div>
          </div>

          {/* SELECTOR */}
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="shrink-0 px-2">
                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                  View
                </p>
              </div>

              <select
                value={selectedFilter}
                onChange={(event) =>
                  handleFilterChange(
                    event.target.value
                  )
                }
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071f11] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-green-500"
              >
                <option value="all">
                  All Images
                </option>

                <option value="attached">
                  Photos Attached to Memories
                </option>

                <option value="unattached">
                  Unattached Photos
                </option>

                <option disabled>
                  ─────────────
                </option>

                {memories.map((memory) => (
                  <option
                    key={memory.id}
                    value={memory.id}
                  >
                    {memory.year} —{" "}
                    {memory.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300">
              {message}
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-green-400" />

              <p className="text-sm text-green-100/50">
                Loading archive...
              </p>
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-24 text-center">
              <div className="mb-4 text-5xl">
                📸
              </div>

              <h2 className="text-xl font-bold">
                No photos here yet
              </h2>

              <p className="mt-2 text-sm text-green-100/50">
                Try another archive view or upload
                some photos from the Admin Portal.
              </p>
            </div>
          ) : (
            <>
              {/* COMPACT PHOTO GRID */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {photos.map((photo) => {
                  const memory =
                    getMemory(photo);

                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(
                          photo
                        );

                        setAttachMemoryId(
                          photo.memory_id ?? ""
                        );

                        setMessage("");
                      }}
                      className="group relative aspect-square overflow-hidden rounded-lg bg-[#0a2113] text-left outline-none ring-green-400 transition focus:ring-2"
                    >
                      <img
                        src={photo.image_url}
                        alt={
                          photo.caption ??
                          memory?.title ??
                          "Archived photo"
                        }
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* DESKTOP HOVER INFO */}
                      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 opacity-0 transition duration-200 group-hover:opacity-100">
                        <p className="text-xs font-semibold text-white">
                          {formatDate(
                            photo.created_at
                          )}
                        </p>

                        {memory ? (
                          <>
                            <p className="mt-1 truncate text-xs font-bold text-green-300">
                              {memory.title}
                            </p>

                            {memory.location && (
                              <p className="mt-0.5 truncate text-[11px] text-white/70">
                                📍{" "}
                                {memory.location}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-yellow-300">
                            Unattached
                          </p>
                        )}
                      </div>

                      {/* SMALL MOBILE STATUS */}
                      <div className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-1.5 py-1 text-[9px] font-semibold text-white backdrop-blur-sm sm:hidden">
                        {memory
                          ? memory.title
                          : "Unattached"}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* LOAD MORE */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-7 py-3 text-sm font-bold text-white transition hover:border-green-500/30 hover:bg-green-500/10 disabled:opacity-50"
                  >
                    {loadingMore
                      ? "Loading..."
                      : "Load More Photos"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* EXPANDED PHOTO VIEWER */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedPhoto(null)
          }
        >
          <div
            className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07150c] shadow-2xl lg:flex-row"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* IMAGE */}
            <div className="relative flex min-h-[45vh] flex-1 items-center justify-center bg-black">
              <img
                src={selectedPhoto.image_url}
                alt={
                  selectedPhoto.caption ??
                  "Archived photo"
                }
                className="max-h-[75vh] max-w-full object-contain"
              />

              <button
                type="button"
                onClick={() =>
                  setSelectedPhoto(null)
                }
                className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-2 text-sm font-bold text-white hover:bg-black"
              >
                ✕
              </button>
            </div>

            {/* DETAILS */}
            <div className="w-full overflow-y-auto p-6 lg:w-80">
              <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                Photo Details
              </p>

              <h2 className="mt-3 text-xl font-bold text-white">
                {getMemory(selectedPhoto)
                  ?.title ??
                  "Unattached Photo"}
              </h2>

              <div className="mt-5 space-y-4 text-sm">

                <div>
                  <p className="text-xs text-white/40">
                    Uploaded
                  </p>

                  <p className="mt-1 text-white/80">
                    {formatDate(
                      selectedPhoto.created_at
                    )}
                  </p>
                </div>

                {getMemory(
                  selectedPhoto
                )?.year && (
                  <div>
                    <p className="text-xs text-white/40">
                      Memory Year
                    </p>

                    <p className="mt-1 text-white/80">
                      {
                        getMemory(
                          selectedPhoto
                        )?.year
                      }
                    </p>
                  </div>
                )}

                {getMemory(
                  selectedPhoto
                )?.location && (
                  <div>
                    <p className="text-xs text-white/40">
                      Location
                    </p>

                    <p className="mt-1 text-white/80">
                      📍{" "}
                      {
                        getMemory(
                          selectedPhoto
                        )?.location
                      }
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-white/40">
                    Status
                  </p>

                  <p
                    className={`mt-1 font-semibold ${
                      selectedPhoto.memory_id
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {selectedPhoto.memory_id
                      ? "Attached to memory"
                      : "Not attached"}
                  </p>
                </div>
              </div>

              {/* ATTACH */}
              {!selectedPhoto.memory_id && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-sm font-bold text-white">
                    Attach to a Memory
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    The existing photo will be connected
                    to the memory without being uploaded
                    again.
                  </p>

                  <select
                    value={attachMemoryId}
                    onChange={(event) =>
                      setAttachMemoryId(
                        event.target.value
                      )
                    }
                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#0c2414] px-3 py-3 text-sm text-white outline-none focus:border-green-500"
                  >
                    <option value="">
                      Select a memory...
                    </option>

                    {memories.map((memory) => (
                      <option
                        key={memory.id}
                        value={memory.id}
                      >
                        {memory.year} —{" "}
                        {memory.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={
                      attachPhotoToMemory
                    }
                    disabled={
                      attaching ||
                      !attachMemoryId
                    }
                    className="mt-3 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-green-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {attaching
                      ? "Attaching..."
                      : "Attach Photo 🔗"}
                  </button>
                </div>
              )}

              {/* ALREADY ATTACHED */}
              {selectedPhoto.memory_id && (
                <div className="mt-8 rounded-xl bg-green-500/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                    Connected
                  </p>

                  <p className="mt-2 text-sm text-green-100/70">
                    This photo is attached to{" "}
                    <span className="font-bold text-green-300">
                      {
                        getMemory(
                          selectedPhoto
                        )?.title
                      }
                    </span>
                    .
                  </p>
                </div>
              )}

              {/* DELETE */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() =>
                    deletePhoto(
                      selectedPhoto
                    )
                  }
                  disabled={deleting}
                  className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Photo 🗑️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}