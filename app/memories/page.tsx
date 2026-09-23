import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { getSiteContent } from "@/lib/site-content";

type Props = {
  searchParams: Promise<{
    location?: string;
  }>;
};

export default async function MemoriesPage({ searchParams }: Props) {
  const content = await getSiteContent();
  const page = content.pages.memories;
  const params = await searchParams;
  const location = params.location;

  let query = supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: false });

  if (location) {
    query = query.eq("location", location);
  }

  const { data: memories, error } = await query;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">

        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">

            <div>
              <p className="uppercase tracking-[0.3em] text-green-300 mb-4">
                {page.eyebrow}
              </p>

              <h1 className="text-6xl font-bold text-white mb-4">
                {location ? `${location} ${page.title}` : page.title}
              </h1>

              <p className="text-green-100 text-xl">
                {location
                  ? `Memories connected to the ${location.toLowerCase()}.`
                  : page.description}
              </p>
            </div>

            {location && (
              <Link
                href="/memories"
                className="rounded-xl bg-white/10 border border-white/20 px-6 py-3 text-white font-semibold hover:bg-white/20 transition"
              >
                View All Memories
              </Link>
            )}

          </div>

          {error ? (
            <div className="rounded-3xl bg-white p-10">
              <h2 className="text-2xl font-bold text-red-700 mb-3">
                Memories couldn't load
              </h2>

              <p className="text-gray-600">
                {error.message}
              </p>
            </div>

          ) : memories && memories.length > 0 ? (

            <div className="grid md:grid-cols-2 gap-8">

              {memories.map((memory) => (

                <Link
                  key={memory.id}
                  href={`/memories/${memory.id}`}
                  className="group rounded-3xl bg-white p-8 shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >

                  <div className="flex items-start gap-6">

                    <div className="text-6xl group-hover:scale-110 transition">
                      {memory.emoji || "📸"}
                    </div>

                    <div className="flex-1">

                      <p className="text-green-700 font-bold mb-1">
                        {memory.year}
                      </p>

                      <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        {memory.title}
                      </h2>

                      {memory.location && (
                        <p className="text-green-700 font-medium mb-3">
                          📍 {memory.location}
                        </p>
                      )}

                      <p className="text-gray-600 leading-7">
                        {memory.description}
                      </p>

                      <p className="text-green-700 font-semibold mt-6">
                        View memory →
                      </p>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          ) : (

            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">

              <div className="text-7xl mb-6">
                🌿
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                No memories here yet.
              </h2>

              <p className="text-gray-600 text-lg mt-4">
                There aren't any memories connected to this location yet.
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
