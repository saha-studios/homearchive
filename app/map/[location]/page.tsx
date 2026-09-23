import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const locationInfo: Record<
  string,
  {
    name: string;
    emoji: string;
    description: string;
  }
> = {
  house: {
    name: "House",
    emoji: "🏡",
    description: "The heart of the estate and the center of everyday life.",
  },
  gate: {
    name: "Gate",
    emoji: "🚪",
    description: "The entrance to the estate and the beginning of every journey home.",
  },
  "mango-tree": {
    name: "Mango Tree",
    emoji: "🌳",
    description: "One of the memorable landmarks around the estate.",
  },
  garden: {
    name: "Garden",
    emoji: "🌱",
    description: "Plants, flowers, growth and the changing life of the garden.",
  },
  driveway: {
    name: "Driveway",
    emoji: "🚗",
    description: "The path leading into and through the estate.",
  },
};

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;

  const info = locationInfo[location];

  const locationName = info?.name || location.replace(/-/g, " ");

  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .eq("location", locationName)
    .order("year", { ascending: false });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">

        <div className="max-w-6xl mx-auto">

          {/* Header */}

          <div className="mb-16">

            <Link
              href="/"
              className="text-green-300 hover:text-white transition"
            >
              ← Back to Home
            </Link>

            <div className="mt-10 flex items-center gap-5">

              <div className="text-7xl">
                {info?.emoji || "📍"}
              </div>

              <div>

                <p className="uppercase tracking-[0.3em] text-green-300 font-semibold mb-2">
                  Estate Location
                </p>

                <h1 className="text-5xl md:text-6xl font-bold text-white capitalize">
                  {locationName}
                </h1>

              </div>

            </div>

            <p className="text-green-100 text-xl mt-6 max-w-3xl">
              {info?.description ||
                `Memories connected to ${locationName}.`}
            </p>

          </div>

          {/* Memories */}

          {error ? (

            <div className="rounded-3xl bg-white p-10 shadow-2xl">

              <h2 className="text-2xl font-bold text-red-700">
                Couldn't load memories
              </h2>

              <p className="text-gray-600 mt-3">
                {error.message}
              </p>

            </div>

          ) : memories && memories.length > 0 ? (

            <div>

              <div className="flex items-center justify-between mb-8">

                <h2 className="text-3xl font-bold text-white">
                  Memories from here
                </h2>

                <span className="rounded-full bg-white/10 border border-white/20 px-4 py-2 text-green-100">
                  {memories.length}{" "}
                  {memories.length === 1 ? "Memory" : "Memories"}
                </span>

              </div>

              <div className="grid md:grid-cols-2 gap-8">

                {memories.map((memory) => (

                  <Link
                    key={memory.id}
                    href={`/memories/${memory.id}`}
                    className="group rounded-3xl bg-white p-8 shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >

                    <div className="flex gap-5">

                      <div className="text-5xl group-hover:scale-110 transition">
                        {memory.emoji || "📸"}
                      </div>

                      <div className="flex-1">

                        <p className="text-green-700 font-bold">
                          {memory.year}
                        </p>

                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                          {memory.title}
                        </h3>

                        <p className="text-gray-600 mt-4 leading-7">
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

            </div>

          ) : (

            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">

              <div className="text-7xl mb-6">
                {info?.emoji || "📍"}
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                No memories here yet.
              </h2>

              <p className="text-gray-600 text-lg mt-4 max-w-xl mx-auto">
                This location doesn't have any memories attached to it yet.
                Add one through the Admin Dashboard and it will appear here.
              </p>

              <Link
                href="/admin"
                className="inline-block mt-8 rounded-xl bg-green-700 px-7 py-4 font-bold text-white hover:bg-green-800 transition"
              >
                Add a Memory →
              </Link>

            </div>

          )}

          {/* Navigation */}

          <div className="mt-16 flex justify-center">

            <Link
              href="/"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition"
            >
              ← Back to Estate Map
            </Link>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}