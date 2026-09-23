import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const content = await getSiteContent();
  const page = content.pages.gallery;
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
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">
        <div className="max-w-7xl mx-auto">

          <p className="uppercase tracking-[0.3em] text-green-300 mb-4">
            {page.eyebrow}
          </p>

          <h1 className="text-6xl font-bold text-white mb-4">
            {page.title}
          </h1>

          <p className="text-green-100 text-xl mb-16">
            {page.description}
          </p>

          {error ? (
            <div className="rounded-3xl bg-white p-10">
              <h2 className="text-2xl font-bold text-red-700 mb-3">
                Gallery couldn't load
              </h2>

              <p className="text-gray-600">
                {error.message}
              </p>
            </div>
          ) : photos && photos.length > 0 ? (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {photos.map((photo) => {

                const memory = Array.isArray(photo.memories)
                  ? photo.memories[0]
                  : photo.memories;

                return (
                  <Link
                    key={photo.id}
                    href={`/memories/${photo.memory_id}`}
                    className="group overflow-hidden rounded-3xl bg-white shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >

                    <div className="relative h-80 overflow-hidden bg-green-100">

                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Home Archive photo"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                    </div>

                    <div className="p-6">

                      {memory && (
                        <>
                          <p className="text-green-700 font-bold">
                            {memory.year}
                          </p>

                          <h2 className="text-2xl font-bold text-gray-900 mt-1">
                            {memory.title}
                          </h2>

                          {memory.location && (
                            <p className="text-gray-500 mt-2">
                              📍 {memory.location}
                            </p>
                          )}
                        </>
                      )}

                      {photo.caption && (
                        <p className="text-gray-600 mt-4">
                          {photo.caption}
                        </p>
                      )}

                      <p className="text-green-700 font-semibold mt-5">
                        View memory →
                      </p>

                    </div>

                  </Link>
                );
              })}

            </div>

          ) : (

            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">

              <div className="text-7xl mb-6">
                📸
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                The gallery is waiting.
              </h2>

              <p className="text-gray-600 text-lg mt-4">
                Add some memories with photos from the Admin Dashboard.
              </p>

              <Link
                href="/admin"
                className="inline-block mt-8 rounded-xl bg-green-700 px-7 py-4 font-bold text-white hover:bg-green-800 transition"
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
