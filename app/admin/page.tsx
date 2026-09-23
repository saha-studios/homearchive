"use client";

import { useEffect, useState } from "react";
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

type Photo = {
  id: number;
  memory_id: string | null;
  image_url: string;
  caption: string | null;
};

export default function AdminPage() {
  // MEMORY FORM
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📸");
  const [files, setFiles] = useState<FileList | null>(null);

  // QUICK PHOTO ARCHIVE
  const [archiveFiles, setArchiveFiles] = useState<FileList | null>(null);
  const [archiveUploading, setArchiveUploading] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState(0);

  // DATA
  const [memories, setMemories] = useState<Memory[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  // GENERAL STATE
  const [loading, setLoading] = useState(false);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadData() {
    setLoadingMemories(true);

    const { data: memoryData, error: memoryError } = await supabase
      .from("memories")
      .select("*")
      .order("year", { ascending: false });

    if (memoryError) {
      console.error(memoryError);
    } else {
      setMemories(memoryData || []);
    }

    const { data: photoData, error: photoError } = await supabase
      .from("memory_photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (photoError) {
      console.error(photoError);
    } else {
      setPhotos(photoData || []);
    }

    setLoadingMemories(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------
  // MEMORY FUNCTIONS
  // -----------------------------

  function startEditing(memory: Memory) {
    setEditingId(memory.id);
    setTitle(memory.title);
    setYear(String(memory.year));
    setLocation(memory.location || "");
    setDescription(memory.description || "");
    setEmoji(memory.emoji || "📸");
    setFiles(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setYear("");
    setLocation("");
    setDescription("");
    setEmoji("📸");
    setFiles(null);
    setUploadProgress(0);

    const fileInput = document.getElementById(
      "photos"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  }

  function cancelEditing() {
    clearForm();
  }

  async function uploadPhotos(memoryId: string, selectedFiles: File[]) {
    const total = selectedFiles.length;

    if (total === 0) {
      setUploadProgress(100);
      return;
    }

    let completed = 0;

    const uploadOne = async (file: File) => {
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

      const filePath = `${memoryId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("archive-photos")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrl } = supabase.storage
        .from("archive-photos")
        .getPublicUrl(filePath);

      const { error: photoError } = await supabase
        .from("memory_photos")
        .insert({
          memory_id: memoryId,
          image_url: publicUrl.publicUrl,
          caption: title,
        });

      if (photoError) {
        throw photoError;
      }

      completed += 1;
      setUploadProgress(Math.round((completed / total) * 100));
    };

    const batchSize = 4;

    for (let i = 0; i < selectedFiles.length; i += batchSize) {
      const batch = selectedFiles.slice(i, i + batchSize);
      await Promise.all(batch.map(uploadOne));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title || !year) {
      setMessage("Please enter a title and year.");
      return;
    }

    setLoading(true);
    setMessage("");
    setUploadProgress(0);

    try {
      // EDIT MEMORY
      if (editingId) {
        const { error } = await supabase
          .from("memories")
          .update({
            title,
            year: Number(year),
            location,
            description,
            emoji,
          })
          .eq("id", editingId);

        if (error) {
          throw error;
        }

        setMessage("Memory updated successfully! ✨");

        clearForm();
        await loadData();

        return;
      }

      // CREATE MEMORY
      const { data: memory, error: memoryError } = await supabase
        .from("memories")
        .insert({
          title,
          year: Number(year),
          location,
          description,
          emoji,
        })
        .select()
        .single();

      if (memoryError) {
        throw memoryError;
      }

      // MEMORY PHOTO UPLOAD
      if (files && files.length > 0) {
        const selectedFiles = Array.from(files);

        setMessage(
          `Uploading ${selectedFiles.length} photo${
            selectedFiles.length === 1 ? "" : "s"
          }...`
        );

        await uploadPhotos(memory.id, selectedFiles);
      }

      setMessage(
        files && files.length > 0
          ? `Memory added with ${files.length} photos! 🌿📸`
          : "Memory added successfully! 🌿"
      );

      clearForm();
      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? `Something went wrong: ${error.message}`
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // QUICK PHOTO ARCHIVE
  // -----------------------------

  async function uploadArchivePhotos() {
    if (!archiveFiles || archiveFiles.length === 0) {
      setMessage("Please select some photos first.");
      return;
    }

    setArchiveUploading(true);
    setArchiveProgress(0);
    setMessage("");

    try {
      const selectedFiles = Array.from(archiveFiles);
      const total = selectedFiles.length;
      let completed = 0;

      const uploadOne = async (file: File) => {
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

        const filePath = `standalone/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("archive-photos")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrl } = supabase.storage
          .from("archive-photos")
          .getPublicUrl(filePath);

        const { error: photoError } = await supabase
          .from("memory_photos")
          .insert({
            memory_id: null,
            image_url: publicUrl.publicUrl,
            caption: null,
          });

        if (photoError) {
          throw photoError;
        }

        completed += 1;
        setArchiveProgress(Math.round((completed / total) * 100));
      };

      // Upload 4 photos at a time.
      const batchSize = 4;

      for (let i = 0; i < selectedFiles.length; i += batchSize) {
        const batch = selectedFiles.slice(i, i + batchSize);
        await Promise.all(batch.map(uploadOne));
      }

      setMessage(
        `${total} photo${total === 1 ? "" : "s"} added to the Photo Archive! 📸✨`
      );

      setArchiveFiles(null);
      setArchiveProgress(100);

      const archiveInput = document.getElementById(
        "archive-photos"
      ) as HTMLInputElement | null;

      if (archiveInput) {
        archiveInput.value = "";
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? `Photo archive upload failed: ${error.message}`
          : "Photo archive upload failed."
      );
    } finally {
      setArchiveUploading(false);
    }
  }

  // -----------------------------
  // DELETE MEMORY
  // -----------------------------

  async function deleteMemory(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this memory and its photos?"
    );

    if (!confirmed) return;

    setMessage("Deleting...");

    try {
      const { data: memoryPhotos, error: fetchPhotosError } = await supabase
        .from("memory_photos")
        .select("*")
        .eq("memory_id", id);

      if (fetchPhotosError) {
        throw new Error(
          `Could not find photos: ${fetchPhotosError.message}`
        );
      }

      const { error: photosError } = await supabase
        .from("memory_photos")
        .delete()
        .eq("memory_id", id);

      if (photosError) {
        throw new Error(
          `Could not delete photo records: ${photosError.message}`
        );
      }

      const { error: memoryError } = await supabase
        .from("memories")
        .delete()
        .eq("id", id);

      if (memoryError) {
        throw new Error(
          `Could not delete memory: ${memoryError.message}`
        );
      }

      if (memoryPhotos && memoryPhotos.length > 0) {
        const storagePaths = memoryPhotos
          .map((photo) => {
            const marker = "/archive-photos/";
            const index = photo.image_url.indexOf(marker);

            if (index === -1) return null;

            return decodeURIComponent(
              photo.image_url.substring(index + marker.length)
            );
          })
          .filter(Boolean) as string[];

        if (storagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("archive-photos")
            .remove(storagePaths);

          if (storageError) {
            console.error("Storage deletion error:", storageError);
          }
        }
      }

      setMessage("Memory deleted successfully! 🗑️");

      await loadData();
    } catch (error) {
      console.error("DELETE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting."
      );
    }
  }

  // -----------------------------
  // DELETE PHOTO
  // -----------------------------

  async function deletePhoto(photo: Photo) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmed) return;

    try {
      const marker = "/archive-photos/";
      const index = photo.image_url.indexOf(marker);

      if (index !== -1) {
        const storagePath = decodeURIComponent(
          photo.image_url.substring(index + marker.length)
        );

        const { error: storageError } = await supabase.storage
          .from("archive-photos")
          .remove([storagePath]);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
        }
      }

      const { error } = await supabase
        .from("memory_photos")
        .delete()
        .eq("id", photo.id);

      if (error) {
        throw error;
      }

      setMessage("Photo deleted successfully.");

      await loadData();
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? `Something went wrong: ${error.message}`
          : "Something went wrong."
      );
    }
  }

  const photoCount = photos.length;

  // Standalone photos have no memory attached.
  const standalonePhotos = photos.filter(
    (photo) => photo.memory_id === null
  );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] px-8 pb-24 pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 uppercase tracking-[0.3em] text-green-300">
            Home Archive
          </p>

          <h1 className="mb-4 text-5xl font-bold text-white">
            Admin Dashboard
          </h1>

          <p className="mb-10 text-lg text-green-100">
            Manage the memories, photos, and stories of your home.
          </p>

          {/* STATS */}
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="font-semibold text-gray-500">Total Memories</p>
              <p className="mt-2 text-4xl font-bold text-green-700">
                {memories.length}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="font-semibold text-gray-500">Total Photos</p>
              <p className="mt-2 text-4xl font-bold text-green-700">
                {photoCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="font-semibold text-gray-500">Latest Year</p>
              <p className="mt-2 text-4xl font-bold text-green-700">
                {memories.length > 0 ? memories[0].year : "—"}
              </p>
            </div>
          </div>

          {/* MEMORY FORM */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-8 shadow-2xl md:p-10"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingId ? "Edit Memory" : "Add New Memory"}
                </h2>

                <p className="mt-1 text-gray-500">
                  {editingId
                    ? "Update this chapter of your home."
                    : "Add a new chapter to the story of your home."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-800">
                  Memory Title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Garden Expansion"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  Year
                </label>

                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-gray-800">
                  Emoji
                </label>

                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🌱"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-800">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Garden, House, Driveway..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block font-semibold text-gray-800">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the story behind this memory..."
                  rows={5}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {!editingId && (
                <div className="md:col-span-2">
                  <label className="mb-2 block font-semibold text-gray-800">
                    📸 Photos
                  </label>

                  <div className="rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-6">
                    <input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-700"
                    />

                    {files && files.length > 0 ? (
                      <div className="mt-4 rounded-xl bg-white p-4">
                        <p className="font-bold text-green-800">
                          {files.length} photo
                          {files.length === 1 ? "" : "s"} selected 📸
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          All selected photos will be added to this memory.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500">
                        Select as many photos as you want. You can choose a
                        whole batch at once.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {loading && files && files.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold text-gray-700">
                  <span>Uploading photos...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-700 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-green-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading
                ? files && files.length > 0
                  ? `Uploading ${files.length} photos...`
                  : "Saving..."
                : editingId
                ? "Update Memory ✨"
                : files && files.length > 0
                ? `Save Memory + ${files.length} Photos 📸`
                : "Save Memory 🌿"}
            </button>

            {message && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-center font-semibold text-green-800">
                {message}
              </div>
            )}
          </form>

          {/* QUICK PHOTO ARCHIVE */}
          <section className="mt-10 rounded-3xl border border-green-300/20 bg-gradient-to-br from-[#062b16] to-[#010a05] p-8 shadow-2xl md:p-10">
            <div className="mb-7">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-green-400">
                Quick Upload
              </p>

              <h2 className="text-3xl font-bold text-white">
                📸 Photo Archive
              </h2>

              <p className="mt-2 max-w-2xl text-green-100/70">
                Dump photos here without attaching them to a memory. Perfect
                for photos you want to keep in the archive but organize later.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-green-400/30 bg-black/20 p-6">
              <input
                id="archive-photos"
                type="file"
                accept="image/*"
                multiple
                disabled={archiveUploading}
                onChange={(e) => setArchiveFiles(e.target.files)}
                className="w-full rounded-xl border border-white/10 bg-white p-3 text-gray-700"
              />

              {archiveFiles && archiveFiles.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-green-400/20 bg-green-500/10 p-5">
                  <p className="text-xl font-bold text-green-300">
                    {archiveFiles.length} photo
                    {archiveFiles.length === 1 ? "" : "s"} selected 📸
                  </p>

                  <p className="mt-1 text-sm text-green-100/60">
                    These will be saved without being attached to a memory.
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-3 text-5xl">📸</div>

                  <p className="text-lg font-bold text-white">
                    Drop a bunch of photos here
                  </p>

                  <p className="mt-2 text-sm text-green-100/60">
                    Or use the button above to choose multiple photos.
                  </p>
                </div>
              )}
            </div>

            {archiveUploading && (
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm font-semibold text-green-100">
                  <span>Uploading archive photos...</span>
                  <span>{archiveProgress}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${archiveProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={uploadArchivePhotos}
              disabled={
                archiveUploading ||
                !archiveFiles ||
                archiveFiles.length === 0
              }
              className="mt-6 w-full rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-green-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {archiveUploading
                ? `Uploading ${archiveFiles?.length || 0} Photos...`
                : archiveFiles && archiveFiles.length > 0
                ? `Upload ${archiveFiles.length} Photos to Archive 📸`
                : "Upload Photos to Archive 📸"}
            </button>
          </section>

          {/* STANDALONE PHOTO COUNT */}
          {standalonePhotos.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white/10 p-5 text-center backdrop-blur">
              <p className="font-semibold text-green-100">
                📸 {standalonePhotos.length} standalone photo
                {standalonePhotos.length === 1 ? "" : "s"} in the archive
              </p>
            </div>
          )}

          {/* MEMORIES */}
          <section className="mt-12">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-green-300">
                Archive
              </p>

              <h2 className="text-3xl font-bold text-white">
                Your Memories
              </h2>
            </div>

            {loadingMemories ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
                <p className="text-gray-600">Loading memories...</p>
              </div>
            ) : memories.length === 0 ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
                <p className="mb-4 text-5xl">📭</p>

                <h3 className="text-2xl font-bold text-gray-900">
                  No memories yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Add your first memory above.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {memories.map((memory) => {
                  const memoryPhotos = photos.filter(
                    (photo) => photo.memory_id === memory.id
                  );

                  return (
                    <div
                      key={memory.id}
                      className="rounded-3xl bg-white p-7 shadow-2xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">
                          {memory.emoji || "📸"}
                        </div>

                        <div>
                          <p className="font-bold text-green-700">
                            {memory.year}
                          </p>

                          <h3 className="text-2xl font-bold text-gray-900">
                            {memory.title}
                          </h3>

                          {memory.location && (
                            <p className="mt-1 text-sm text-gray-500">
                              📍 {memory.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {memory.description && (
                        <p className="mt-5 leading-7 text-gray-600">
                          {memory.description}
                        </p>
                      )}

                      {memoryPhotos.length > 0 ? (
                        <div className="mt-6">
                          <p className="mb-3 font-bold text-gray-800">
                            Photos ({memoryPhotos.length})
                          </p>

                          <div className="grid grid-cols-3 gap-3">
                            {memoryPhotos.map((photo) => (
                              <div
                                key={photo.id}
                                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
                              >
                                <img
                                  src={photo.image_url}
                                  alt={photo.caption || memory.title}
                                  className="h-full w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() => deletePhoto(photo)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 font-bold text-white opacity-0 transition group-hover:opacity-100"
                                >
                                  Delete
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
                          <p className="text-sm text-gray-500">
                            No photos attached
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => startEditing(memory)}
                          className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-bold text-white transition hover:bg-green-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteMemory(memory.id)}
                          className="flex-1 rounded-xl border border-red-200 px-4 py-3 font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <SiteStudio />
        </div>
      </main>

      <Footer />
    </>
  );
}