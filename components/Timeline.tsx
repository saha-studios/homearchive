import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Timeline() {
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: true });

  return (
    <section className="bg-[#eef8ef] px-8 py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-green-700">
            Our History
          </p>

          <h2 className="text-5xl font-bold text-green-950 md:text-6xl">
            The Timeline
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
            Follow the story of our home through the years.
          </p>
        </div>

        {/* Error */}
        {error ? (
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center shadow-xl">
            <h3 className="mb-3 text-2xl font-bold text-red-700">
              Timeline couldn't load
            </h3>

            <p className="text-gray-600">
              Something went wrong while loading our memories.
            </p>

            <Link
              href="/timeline"
              className="mt-6 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Open Full Timeline →
            </Link>
          </div>
        ) : memories && memories.length > 0 ? (
          <>
            {/* Timeline */}
            <div className="relative mx-auto max-w-5xl">
              {/* Center line */}
              <div className="absolute left-4 top-0 h-full w-1 rounded-full bg-green-300 md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-12">
                {memories.slice(0, 6).map((memory, index) => (
                  <div
                    key={memory.id}
                    className={`relative flex items-center md:w-1/2 ${
                      index % 2 === 0
                        ? "md:mr-auto md:pr-12"
                        : "md:ml-auto md:pl-12"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#eef8ef] bg-green-700 text-sm md:left-auto md:right-0 md:translate-x-1/2">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </div>

                    {index % 2 !== 0 && (
                      <div className="absolute left-4 z-10 hidden h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#eef8ef] bg-green-700 md:left-0 md:flex md:translate-x-[-50%]">
                        <span className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}

                    {/* Memory card */}
                    <Link
                      href={`/memories/${memory.id}`}
                      className="ml-10 block w-full rounded-3xl bg-white p-7 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:ml-0"
                    >
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="text-3xl">
                          {memory.emoji || "📸"}
                        </span>

                        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-800">
                          {memory.year}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900">
                        {memory.title}
                      </h3>

                      {memory.location && (
                        <p className="mt-2 text-sm font-medium text-green-700">
                          📍 {memory.location}
                        </p>
                      )}

                      {memory.description && (
                        <p className="mt-4 line-clamp-3 text-gray-600">
                          {memory.description}
                        </p>
                      )}

                      <p className="mt-5 font-bold text-green-700">
                        View memory →
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* View full timeline */}
            <div className="mt-16 text-center">
              <Link
                href="/timeline"
                className="inline-flex items-center gap-3 rounded-2xl bg-green-800 px-7 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-green-900"
              >
                View Full Timeline
                <span>→</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-12 text-center shadow-xl">
            <div className="mb-5 text-6xl">🌱</div>

            <h3 className="text-3xl font-bold text-gray-900">
              Our story is just beginning.
            </h3>

            <p className="mt-4 text-gray-600">
              Add memories from the Admin Dashboard and they'll appear here.
            </p>

            <Link
              href="/admin"
              className="mt-7 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800"
            >
              Add a Memory →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}