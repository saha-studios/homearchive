"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import SiteStudio from "@/components/SiteStudio";

type Memory = {
  id: string;
  title: string;
  year: number;
  location: string | null;
  description: string | null;
  emoji: string | null;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function retry<T>(
  action: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        await sleep(700 * attempt);
      }
    }
  }

  throw lastError;
}

function getStoragePath(imageUrl: string) {
  const marker = "/storage/v1/object/public/archive-photos/";

  const index = imageUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    imageUrl.substring(index + marker.length)
  );
}

export default function AdminPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [photoCounts, setPhotoCounts] = useState<
    Record<string, number>
  >({});

  const [photoCount, setPhotoCount] = useState(0);
  const [unattachedCount, setUnattachedCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📸");
  const [files, setFiles] = useState<FileList | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  async function loadData() {
    setLoading(true);

    const [
      memoryResult,
      photoCountResult,
      unattachedResult,
      photoMemoryResult,
    ] = await Promise.all([
      supabase
        .from("memories")
        .select(
          "id,title,year,location,description,emoji"
        )
        .order("year", { ascending: false }),

      supabase
        .from("memory_photos")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("memory_photos")
        .select("id", {
          count: "exact",
          head: true,
        })
        .is("memory_id", null),

      supabase
        .from("memory_photos")
        .select("memory_id"),
    ]);

    if (memoryResult.error) {
      console.error(memoryResult.error);
      setMessage(
        `Could not load memories: ${memoryResult.error.message}`
      );
    }

    if (photoCountResult.error) {
      console.error(photoCountResult.error);
    }

    if (unattachedResult.error) {
      console.error(unattachedResult.error);
    }

    if (photoMemoryResult.error) {
      console.error(photoMemoryResult.error);
    }

    const counts: Record<string, number> = {};

    for (const photo of photoMemoryResult.data ?? []) {
      if (!photo.memory_id) continue;

      counts[photo.memory_id] =
        (counts[photo.memory_id] ?? 0) + 1;
    }

    setMemories(memoryResult.data ?? []);
    setPhotoCounts(counts);
    setPhotoCount(photoCountResult.count ?? 0);
    setUnattachedCount(unattachedResult.count ?? 0);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setTitle("");
    setYear(new Date().getFullYear());
    setLocation("");
    setDescription("");
    setEmoji("📸");
    setFiles(null);
    setEditingId(null);

    const input = document.getElementById(
      "memory-files"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function uploadOnePhoto(
    file: File,
    memoryId: string | null,
    caption: string
  ) {
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase();

    const folder = memoryId ?? "standalone";

    const filePath = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safeName}`;

    await retry(async () => {
      const { error } = await supabase.storage
        .from("archive-photos")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        });

      if (error) {
        throw new Error(error.message);
      }
    });

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("archive-photos")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    await retry(async () => {
      const { error } = await supabase
        .from("memory_photos")
        .insert({
          memory_id: memoryId,
          image_url: imageUrl,
          caption,
        });

      if (error) {
        throw new Error(error.message);
      }
    });
  }

  async function uploadPhotos(
    memoryId: string | null,
    selectedFiles: FileList | File[]
  ) {
    const fileArray = Array.from(selectedFiles);

    if (!fileArray.length) {
      return {
        success: 0,
        failed: [] as string[],
      };
    }

    let success = 0;
    const failed: string[] = [];

    setUploadProgress(0);
    setUploadTotal(fileArray.length);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      setMessage(
        `Uploading ${i + 1} of ${fileArray.length}: ${file.name}`
      );

      try {
        await uploadOnePhoto(
          file,
          memoryId,
          memoryId ? title : file.name
        );

        success++;
      } catch (error) {
        console.error(
          `Failed to upload ${file.name}`,
          error
        );

        failed.push(file.name);
      }

      setUploadProgress(i + 1);
    }

    return {
      success,
      failed,
    };
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a memory title.");
      return;
    }

    if (!year) {
      setMessage("Please enter a year.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let memoryId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from("memories")
          .update({
            title: title.trim(),
            year,
            location: location.trim() || null,
            description:
              description.trim() || null,
            emoji: emoji.trim() || "📸",
          })
          .eq("id", editingId);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { data, error } = await supabase
          .from("memories")
          .insert({
            title: title.trim(),
            year,
            location: location.trim() || null,
            description:
              description.trim() || null,
            emoji: emoji.trim() || "📸",
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        memoryId = data.id;
      }

      let uploadResult = {
        success: 0,
        failed: [] as string[],
      };

      if (
        files &&
        files.length > 0 &&
        memoryId
      ) {
        uploadResult = await uploadPhotos(
          memoryId,
          files
        );
      }

      if (uploadResult.failed.length) {
        setMessage(
          `Memory saved. ${uploadResult.success} photo(s) uploaded. ` +
            `${uploadResult.failed.length} failed: ` +
            uploadResult.failed.join(", ")
        );
      } else if (editingId) {
        setMessage("✓ Memory updated successfully.");
      } else {
        setMessage(
          `✓ Memory saved successfully${
            uploadResult.success
              ? ` with ${uploadResult.success} photo(s).`
              : "."
          }`
        );
      }

      resetForm();

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
      setUploadProgress(0);
      setUploadTotal(0);
    }
  }

  function startEditing(memory: Memory) {
    setEditingId(memory.id);
    setTitle(memory.title);
    setYear(memory.year);
    setLocation(memory.location ?? "");
    setDescription(memory.description ?? "");
    setEmoji(memory.emoji ?? "📸");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteMemory(memory: Memory) {
    const confirmed = window.confirm(
      `Delete "${memory.title}" and all photos attached to it?`
    );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const { data: attachedPhotos, error: photoFetchError } =
        await supabase
          .from("memory_photos")
          .select("image_url")
          .eq("memory_id", memory.id);

      if (photoFetchError) {
        throw new Error(
          photoFetchError.message
        );
      }

      const paths = (attachedPhotos ?? [])
        .map((photo) =>
          getStoragePath(photo.image_url)
        )
        .filter(Boolean) as string[];

      if (paths.length) {
        const { error: storageError } =
          await supabase.storage
            .from("archive-photos")
            .remove(paths);

        if (storageError) {
          console.warn(
            "Storage deletion warning:",
            storageError.message
          );
        }
      }

      const { error: photoDeleteError } =
        await supabase
          .from("memory_photos")
          .delete()
          .eq("memory_id", memory.id);

      if (photoDeleteError) {
        throw new Error(
          photoDeleteError.message
        );
      }

      const { error: memoryDeleteError } =
        await supabase
          .from("memories")
          .delete()
          .eq("id", memory.id);

      if (memoryDeleteError) {
        throw new Error(
          memoryDeleteError.message
        );
      }

      if (editingId === memory.id) {
        resetForm();
      }

      setMessage("✓ Memory deleted.");

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete memory."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadArchivePhotos() {
    const input = document.getElementById(
      "archive-files"
    ) as HTMLInputElement | null;

    if (!input?.files?.length) {
      setMessage("Choose some photos first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await uploadPhotos(
        null,
        input.files
      );

      if (result.failed.length) {
        setMessage(
          `${result.success} photo(s) uploaded. ` +
            `${result.failed.length} failed: ` +
            result.failed.join(", ")
        );
      } else {
        setMessage(
          `✓ ${result.success} photo(s) uploaded successfully.`
        );
      }

      input.value = "";

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Could not upload photos."
      );
    } finally {
      setSaving(false);
      setUploadProgress(0);
      setUploadTotal(0);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#26352d]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8">

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#637866]">
              Home Archive
            </p>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Admin Portal
            </h1>

            <p className="mt-3 max-w-2xl text-[#647066]">
              Manage memories, photos and the growing
              archive of your home.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center rounded-xl border border-[#d5dbd4] bg-white px-5 py-3 text-sm font-semibold text-[#30483a] shadow-sm transition hover:bg-[#f1f3ee]"
          >
            View Website →
          </Link>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-8 rounded-xl border border-[#d9ded8] bg-white px-4 py-3 text-sm text-[#4e5e53] shadow-sm">
            {message}
          </div>
        )}

        {/* STATS */}

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe3dd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#718074]">
              Memories
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#30483a]">
              {loading ? "—" : memories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe3dd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#718074]">
              Photos
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#30483a]">
              {loading ? "—" : photoCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dfe3dd] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#718074]">
              Unattached
            </p>

            <p className="mt-1 text-3xl font-semibold text-[#30483a]">
              {loading ? "—" : unattachedCount}
            </p>
          </div>
        </div>

        {/* ADD / EDIT MEMORY */}

        <div className="mb-12 rounded-2xl border border-[#dfe3dd] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold">
                {editingId
                  ? "Edit Memory"
                  : "Add Memory"}
              </h2>

              {editingId && (
                <span className="rounded-full bg-[#e7eee8] px-3 py-1 text-xs font-semibold text-[#4f6956]">
                  Editing
                </span>
              )}
            </div>

            {editingId ? (
              <p className="mt-2 text-sm text-[#718074]">
                You are editing{" "}
                <span className="font-medium text-[#4f5f53]">
                  {title || "this memory"}
                </span>
                .
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#718074]">
                Create a memory and optionally attach
                photos to it.
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5"
          >
            <div className="grid gap-5 md:grid-cols-2">

              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Memory title"
                className="rounded-xl border border-[#d9ded8] px-4 py-3 outline-none transition focus:border-[#728a77] focus:ring-2 focus:ring-[#e6ece7]"
              />

              <input
                type="number"
                value={year}
                onChange={(event) =>
                  setYear(
                    Number(event.target.value)
                  )
                }
                placeholder="Year"
                className="rounded-xl border border-[#d9ded8] px-4 py-3 outline-none transition focus:border-[#728a77] focus:ring-2 focus:ring-[#e6ece7]"
              />

              <input
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                placeholder="Location"
                className="rounded-xl border border-[#d9ded8] px-4 py-3 outline-none transition focus:border-[#728a77] focus:ring-2 focus:ring-[#e6ece7]"
              />

              <input
                value={emoji}
                onChange={(event) =>
                  setEmoji(event.target.value)
                }
                placeholder="Emoji"
                className="rounded-xl border border-[#d9ded8] px-4 py-3 outline-none transition focus:border-[#728a77] focus:ring-2 focus:ring-[#e6ece7]"
              />
            </div>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Description"
              rows={4}
              className="rounded-xl border border-[#d9ded8] px-4 py-3 outline-none transition focus:border-[#728a77] focus:ring-2 focus:ring-[#e6ece7]"
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Photos for this memory
              </label>

              <input
                id="memory-files"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) =>
                  setFiles(event.target.files)
                }
                className="block w-full text-sm"
              />
            </div>

            {uploadTotal > 0 && (
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    Uploading photos...
                  </span>

                  <span>
                    {uploadProgress}/
                    {uploadTotal}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#e5e8e3]">
                  <div
                    className="h-full rounded-full bg-[#607665] transition-all"
                    style={{
                      width: `${
                        (uploadProgress /
                          uploadTotal) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#30483a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#263a30] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Memory"
                  : "Save Memory"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#d5dbd4] px-6 py-3 text-sm font-semibold text-[#3d4e43] transition hover:bg-[#f3f4f1]"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* QUICK PHOTO ARCHIVE */}

        <div className="mb-12 rounded-2xl border border-[#dfe3dd] bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">
              Quick Photo Archive
            </h2>

            <p className="mt-1 text-sm text-[#718074]">
              Upload photos without attaching them
              to a memory yet. You can attach them
              later from the Gallery.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              id="archive-files"
              type="file"
              accept="image/*"
              multiple
              className="block flex-1 text-sm"
            />

            <button
              type="button"
              onClick={uploadArchivePhotos}
              disabled={saving}
              className="rounded-xl bg-[#30483a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#263a30] disabled:opacity-50"
            >
              {saving
                ? "Uploading..."
                : "Upload Photos"}
            </button>
          </div>

          {uploadTotal > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span>
                  Uploading archive photos...
                </span>

                <span>
                  {uploadProgress}/{uploadTotal}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#e5e8e3]">
                <div
                  className="h-full rounded-full bg-[#607665] transition-all"
                  style={{
                    width: `${
                      (uploadProgress /
                        uploadTotal) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* MEMORIES */}

        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">
              Memories
            </h2>

            <p className="mt-1 text-sm text-[#718074]">
              Edit or remove existing memories.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#dfe3dd] bg-white p-8 text-center text-sm text-[#718074]">
              Loading memories...
            </div>
          ) : memories.length === 0 ? (
            <div className="rounded-2xl border border-[#dfe3dd] bg-white p-8 text-center text-sm text-[#718074]">
              No memories yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {memories.map((memory) => {
                const count =
                  photoCounts[memory.id] ?? 0;

                return (
                  <div
                    key={memory.id}
                    className="rounded-2xl border border-[#dfe3dd] bg-white p-5 shadow-sm transition hover:border-[#cbd5cc]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {memory.emoji ?? "📸"}
                          </span>

                          <h3 className="font-semibold">
                            {memory.title}
                          </h3>
                        </div>

                        <p className="mt-1 text-sm text-[#718074]">
                          {memory.year}
                          {memory.location
                            ? ` • ${memory.location}`
                            : ""}
                        </p>

                        <p className="mt-2 text-xs font-medium text-[#607665]">
                          {count} photo
                          {count === 1
                            ? ""
                            : "s"}
                        </p>
                      </div>
                    </div>

                    {memory.description && (
                      <p className="mt-4 text-sm leading-6 text-[#657067]">
                        {memory.description}
                      </p>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditing(memory)
                        }
                        className="rounded-lg border border-[#d5dbd4] px-4 py-2 text-sm font-medium text-[#3d4e43] transition hover:bg-[#f3f4f1]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteMemory(memory)
                        }
                        disabled={saving}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HOME PAGE EDITOR */}

        <div className="border-t border-[#dfe3dd] pt-12">
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#637866]">
              Website Settings
            </p>

            <h2 className="text-2xl font-semibold">
              Home Page Editor
            </h2>

            <p className="mt-1 max-w-2xl text-sm text-[#718074]">
              Update the content that appears across
              the Home Archive website.
            </p>
          </div>

          <SiteStudio />
        </div>

      </section>

      <Footer />
    </main>
  );
}