import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function LatestMemories() {
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: false })
    .limit(3);

  return (
    <section className="bg-white py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">

          <div>
            <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-4">
              The Archive
            </p>

            <h2 className="text-5xl font-bold text-green-950">
              Latest Memories
            </h2>

            <p className="text-gray-600 text-lg mt-4">
              The newest moments added to Home Archive.
            </p>
          </div>

          <Link
            href="/memories"
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition"
          >
            View All Memories →
          </Link>

        </div>

        {error ? (

          <div className="rounded-3xl bg-red-50 border border-red-100 p-8">
            <p className="font-semibold text-red-700">
              Couldn't load the latest memories.
            </p>
          </div>

        ) : memories && memories.length > 0 ? (

          <div className="grid md:grid-cols-3 gap-8">

            {memories.map((memory) => (

              <Link
                key={memory.id}
                href={`/memories/${memory.id}`}
                className="group rounded-3xl border border-green-100 bg-green-50 p-8 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
              >

                <div className="text-6xl mb-6 group-hover:scale-110 transition">
                  {memory.emoji || "📸"}
                </div>

                <p className="text-green-700 font-bold">
                  {memory.year}
                </p>

                <h3 className="text-2xl font-bold text-gray-900 mt-2">
                  {memory.title}
                </h3>

                {memory.location && (
                  <p className="text-green-700 font-medium mt-3">
                    📍 {memory.location}
                  </p>
                )}

                <p className="text-gray-600 mt-4 leading-7 line-clamp-3">
                  {memory.description}
                </p>

                <p className="mt-6 font-semibold text-green-700">
                  Explore memory →
                </p>

              </Link>

            ))}

          </div>

        ) : (

          <div className="rounded-3xl bg-green-50 p-12 text-center">
            <div className="text-6xl mb-4">
              🌱
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              The archive is just beginning.
            </h3>

            <p className="text-gray-600 mt-3">
              Add your first memory through the Admin Dashboard.
            </p>

            <Link
              href="/admin"
              className="inline-block mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition"
            >
              Add a Memory →
            </Link>
          </div>

        )}

      </div>
    </section>
  );
}