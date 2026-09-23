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
  memory_id: string;
  image_url: string;
  caption: string | null;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("📸");
  const [files, setFiles] = useState<FileList | null>(null);

  const [memories, setMemories] = useState<Memory[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [message, setMessage] = useState("");

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

  function cancelEditing() {
    setEditingId(null);
    setTitle("");
    setYear("");
    setLocation("");
    setDescription("");
    setEmoji("📸");
    setFiles(null);

    const fileInput = document.getElementById(
      "photos"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
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

        cancelEditing();
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

      // UPLOAD PHOTOS
      if (files && files.length > 0) {
        for (const file of Array.from(files)) {
          const fileName = `${Date.now()}-${file.name.replace(
            /[^a-zA-Z0-9.-]/g,
            "-"
          )}`;

          const filePath = `${memory.id}/${fileName}`;

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
              memory_id: memory.id,
              image_url: publicUrl.publicUrl,
              caption: title,
            });

          if (photoError) {
            throw photoError;
          }
        }
      }

      setMessage("Memory added successfully! 🌿");

      setTitle("");
      setYear("");
      setLocation("");
      setDescription("");
      setEmoji("📸");
      setFiles(null);

      const fileInput = document.getElementById(
        "photos"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

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

  async function deleteMemory(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this memory and its photos?"
  );

  if (!confirmed) return;

  setMessage("Deleting...");

  try {
    // 1. Get all photos belonging to this memory
    const { data: memoryPhotos, error: fetchPhotosError } = await supabase
      .from("memory_photos")
      .select("*")
      .eq("memory_id", id);

    if (fetchPhotosError) {
      throw new Error(
        `Could not find photos: ${fetchPhotosError.message}`
      );
    }

    // 2. Delete the photo records
    const { error: photosError } = await supabase
      .from("memory_photos")
      .delete()
      .eq("memory_id", id);

    if (photosError) {
      throw new Error(
        `Could not delete photo records: ${photosError.message}`
      );
    }

    // 3. Delete the memory
    const { error: memoryError } = await supabase
      .from("memories")
      .delete()
      .eq("id", id);

    if (memoryError) {
      throw new Error(
        `Could not delete memory: ${memoryError.message}`
      );
    }

    // 4. Delete the actual image files from Storage
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">
        <div className="max-w-6xl mx-auto">

          <p className="uppercase tracking-[0.3em] text-green-300 mb-4">
            Home Archive
          </p>

          <h1 className="text-5xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>

          <p className="text-green-100 text-lg mb-10">
            Manage the memories, photos, and stories of your home.
          </p>

          {/* STATS */}

          <div className="grid md:grid-cols-3 gap-6 mb-10">

            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="text-gray-500 font-semibold">
                Total Memories
              </p>

              <p className="text-4xl font-bold text-green-700 mt-2">
                {memories.length}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="text-gray-500 font-semibold">
                Total Photos
              </p>

              <p className="text-4xl font-bold text-green-700 mt-2">
                {photoCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-2xl">
              <p className="text-gray-500 font-semibold">
                Latest Year
              </p>

              <p className="text-4xl font-bold text-green-700 mt-2">
                {memories.length > 0 ? memories[0].year : "—"}
              </p>
            </div>

          </div>

          {/* MEMORY FORM */}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
          >

            <div className="flex items-center justify-between gap-4 mb-8">

              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {editingId ? "Edit Memory" : "Add New Memory"}
                </h2>

                <p className="text-gray-500 mt-1">
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

            <div className="grid md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label className="block font-semibold text-gray-800 mb-2">
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
                <label className="block font-semibold text-gray-800 mb-2">
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
                <label className="block font-semibold text-gray-800 mb-2">
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
                <label className="block font-semibold text-gray-800 mb-2">
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
                <label className="block font-semibold text-gray-800 mb-2">
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
                  <label className="block font-semibold text-gray-800 mb-2">
                    Photos
                  </label>

                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full rounded-xl border border-gray-300 p-3 text-gray-700"
                  />

                  <p className="text-sm text-gray-500 mt-2">
                    You can select multiple photos.
                  </p>
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-green-700 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Memory ✨"
                : "Save Memory 🌿"}
            </button>

            {message && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-center font-semibold text-green-800">
                {message}
              </div>
            )}

          </form>

          {/* MEMORIES */}

          <section className="mt-12">

            <div className="mb-6">
              <p className="uppercase tracking-[0.25em] text-green-300 text-sm mb-2">
                Archive
              </p>

              <h2 className="text-3xl font-bold text-white">
                Your Memories
              </h2>
            </div>

            {loadingMemories ? (

              <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
                <p className="text-gray-600">
                  Loading memories...
                </p>
              </div>

            ) : memories.length === 0 ? (

              <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
                <p className="text-5xl mb-4">
                  📭
                </p>

                <h3 className="text-2xl font-bold text-gray-900">
                  No memories yet
                </h3>

                <p className="text-gray-500 mt-2">
                  Add your first memory above.
                </p>
              </div>

            ) : (

              <div className="grid md:grid-cols-2 gap-6">

                {memories.map((memory) => {

                  const memoryPhotos = photos.filter(
                    (photo) => photo.memory_id === memory.id
                  );

                  return (
                    <div
                      key={memory.id}
                      className="rounded-3xl bg-white p-7 shadow-2xl"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-start gap-4">

                          <div className="text-4xl">
                            {memory.emoji || "📸"}
                          </div>

                          <div>
                            <p className="text-green-700 font-bold">
                              {memory.year}
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900">
                              {memory.title}
                            </h3>

                            {memory.location && (
                              <p className="text-sm text-gray-500 mt-1">
                                📍 {memory.location}
                              </p>
                            )}
                          </div>

                        </div>

                      </div>

                      {memory.description && (
                        <p className="mt-5 text-gray-600 leading-7">
                          {memory.description}
                        </p>
                      )}

                      {/* PHOTOS */}

                      {memoryPhotos.length > 0 && (
                        <div className="mt-6">

                          <p className="font-bold text-gray-800 mb-3">
                            Photos ({memoryPhotos.length})
                          </p>

                          <div className="grid grid-cols-3 gap-3">

                            {memoryPhotos.map((photo) => (

                              <div
                                key={photo.id}
                                className="relative group aspect-square overflow-hidden rounded-xl bg-gray-100"
                              >

                                <img
                                  src={photo.image_url}
                                  alt={photo.caption || memory.title}
                                  className="h-full w-full object-cover"
                                />

                                <button
                                  type="button"
                                  onClick={() => deletePhoto(photo)}
                                  className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold opacity-0 transition group-hover:opacity-100"
                                >
                                  Delete
                                </button>

                              </div>

                            ))}

                          </div>

                        </div>
                      )}

                      {memoryPhotos.length === 0 && (
                        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-center">
                          <p className="text-sm text-gray-500">
                            No photos attached
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="flex gap-3 mt-6">

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
