import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type Memory = {
  id: string;
  title: string;
  description: string;
  year: number;
  location: string | null;
  emoji: string | null;
};

type Media = {
  id: string;
  image_url: string;
  caption: string | null;
  media_type: string | null;
};

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: memoryData, error: memoryError } = await supabase
    .from("memories")
    .select("*")
    .eq("id", id)
    .single();

  const memory = memoryData as Memory | null;

  if (memoryError || !memory) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 px-8">
          <div className="max-w-4xl mx-auto text-center">

            <div className="rounded-3xl bg-white p-16 shadow-2xl">

              <div className="text-7xl mb-6">
                🌿
              </div>

              <h1 className="text-4xl font-bold text-gray-900">
                Memory not found
              </h1>

              <p className="text-gray-600 mt-4">
                We couldn't find that memory in the archive.
              </p>

              <Link
                href="/memories"
                className="inline-block mt-8 rounded-xl bg-green-700 px-7 py-4 font-bold text-white hover:bg-green-800 transition"
              >
                ← Back to Memories
              </Link>

            </div>

          </div>
        </main>

        <Footer />
      </>
    );
  }

  const { data: mediaData } = await supabase
    .from("memory_photos")
    .select("id, image_url, caption, media_type")
    .eq("memory_id", id)
    .order("created_at", { ascending: true });

  const media = (mediaData || []) as Media[];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">

        <div className="max-w-6xl mx-auto">

          <Link
            href="/memories"
            className="text-green-300 hover:text-white transition"
          >
            ← Back to Memories
          </Link>

          {/* Memory Header */}

          <div className="mt-10 mb-14">

            <div className="flex items-center gap-5">

              <div className="text-7xl">
                {memory.emoji || "📸"}
              </div>

              <div>

                <p className="uppercase tracking-[0.3em] text-green-300 font-semibold mb-2">
                  {memory.year}
                </p>

                <h1 className="text-5xl md:text-6xl font-bold text-white">
                  {memory.title}
                </h1>

              </div>

            </div>

            {memory.location && (
              <p className="mt-6 text-green-200 text-lg font-semibold">
                📍 {memory.location}
              </p>
            )}

            <p className="mt-5 max-w-3xl text-green-100 text-xl leading-8">
              {memory.description}
            </p>

          </div>

          {/* Media */}

          {media.length > 0 ? (

            <div className="grid md:grid-cols-2 gap-8">

              {media.map((item) => {

                const isVideo = item.media_type === "video";

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-2xl"
                  >

                    {isVideo ? (

                      <video
                        src={item.image_url}
                        controls
                        playsInline
                        className="w-full aspect-video object-cover"
                      />

                    ) : (

                      <img
                        src={item.image_url}
                        alt={item.caption || memory.title}
                        className="w-full aspect-video object-cover"
                      />

                    )}

                    {item.caption && (
                      <div className="p-5">

                        <p className="text-gray-700">
                          {item.caption}
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          ) : (

            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">

              <div className="text-7xl mb-6">
                📸
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                No media yet
              </h2>

              <p className="text-gray-600 mt-4">
                Photos and videos for this memory will appear here.
              </p>

            </div>

          )}

          {/* Bottom navigation */}

          <div className="mt-14 flex justify-center">

            <Link
              href="/memories"
              className="rounded-xl border border-white/20 bg-white/10 px-7 py-4 font-semibold text-white hover:bg-white/20 transition"
            >
              ← Back to All Memories
            </Link>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}