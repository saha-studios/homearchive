import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { defaultSiteContent } from "@/lib/site-content";

export const revalidate = 30;

export default async function GalleryPage() {
  const page = defaultSiteContent.pages.gallery;

  const { data: photos, error } = await supabase
    .from("memory_photos")
    .select(`
      id,
      image_url,
      caption,
      memory_id,
      memories (
        title,
        year,
        location
      )
    `)
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] px-8 pb-24 pt-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 uppercase tracking-[0.3em] text-green-300">
            {page.eyebrow}
          </p>

          <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">
            {page.title}
          </h1>

          <p className="mb-16 text-lg text-green-100 md:text-xl">
            {page.description}
          </p>

          {error ? (
            <div className="rounded-3xl bg-white p-10">
              <h2 className="mb-3 text-2xl font-bold text-red-700">
                Gallery couldn't load
              </h2>

              <p className="text-gray-600">{error.message}</p>
            </div>
          ) : photos && photos.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => {
                const memory = Array.isArray(photo.memories)
                  ? photo.memories[0]
                  : photo.memories;

                return (
                  <Link
                    key={photo.id}
                    href={`/memories/${photo.memory_id}`}
                    className="group overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-72 overflow-hidden bg-green-100 md:h-80">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Home Archive photo"}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-6">
                      {memory && (
                        <>
                          <p className="font-bold text-green-700">
                            {memory.year}
                          </p>

                          <h2 className="mt-1 text-2xl font-bold text-gray-900">
                            {memory.title}
                          </h2>

                          {memory.location && (
                            <p className="mt-2 text-gray-500">
                              📍 {memory.location}
                            </p>
                          )}
                        </>
                      )}

                      {photo.caption && (
                        <p className="mt-4 text-gray-600">
                          {photo.caption}
                        </p>
                      )}

                      <p className="mt-5 font-semibold text-green-700">
                        View memory →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">
              <div className="mb-6 text-7xl">📸</div>

              <h2 className="text-3xl font-bold text-gray-900">
                The gallery is waiting.
              </h2>

              <p className="mt-4 text-lg text-gray-600">
                Add some memories with photos from the Admin Dashboard.
              </p>

              <Link
                href="/admin"
                className="mt-8 inline-block rounded-xl bg-green-700 px-7 py-4 font-bold text-white transition hover:bg-green-800"
              >
                Add a Memory →
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}