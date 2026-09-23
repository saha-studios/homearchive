import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function MemorySpotlight() {
  const { data: memory } = await supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: false })
    .limit(1)
    .single();

  if (!memory) {
    return null;
  }

  const { data: photos } = await supabase
    .from("memory_photos")
    .select("*")
    .eq("memory_id", memory.id)
    .limit(1);

  const photo = photos?.[0];

  return (
    <section className="bg-[#eef8ef] py-28 px-8">

      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div>

            <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-4">
              Memory Spotlight
            </p>

            <h2 className="text-5xl font-bold text-green-950 mb-6">
              {memory.title}
            </h2>

            <p className="text-green-700 font-bold text-lg mb-4">
              {memory.year}
            </p>

            {memory.location && (
              <p className="text-gray-600 font-medium mb-5">
                📍 {memory.location}
              </p>
            )}

            <p className="text-gray-700 text-lg leading-8">
              {memory.description}
            </p>

            <Link
              href={`/memories/${memory.id}`}
              className="inline-block mt-8 rounded-xl bg-green-700 px-7 py-4 font-bold text-white hover:bg-green-800 transition"
            >
              Explore This Memory →
            </Link>

          </div>

          <div className="overflow-hidden rounded-[2rem] bg-green-200 shadow-2xl">

            {photo ? (

              <img
                src={photo.image_url}
                alt={photo.caption || memory.title}
                className="h-[500px] w-full object-cover"
              />

            ) : (

              <div className="h-[500px] flex items-center justify-center">

                <div className="text-center">
                  <div className="text-8xl mb-5">
                    {memory.emoji || "📸"}
                  </div>

                  <p className="text-green-900 font-semibold">
                    Photos coming soon
                  </p>
                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </section>
  );
}