import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

export default async function TimelinePage() {
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: true });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-20">

            <p className="uppercase tracking-[0.3em] text-green-300 mb-4">
              Our History
            </p>

            <h1 className="text-6xl font-bold text-white mb-5">
              Timeline
            </h1>

            <p className="text-green-100 text-xl">
              Follow the story of our home through the years.
            </p>

          </div>

          {error ? (

            <div className="rounded-3xl bg-white p-10 shadow-2xl">

              <h2 className="text-2xl font-bold text-red-700 mb-3">
                Timeline couldn't load
              </h2>

              <p className="text-gray-600">
                {error.message}
              </p>

            </div>

          ) : memories && memories.length > 0 ? (

            <div className="relative">

              {/* Timeline line */}

              <div className="absolute left-5 top-0 bottom-0 w-1 bg-green-300 md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-12">

                {memories.map((memory, index) => {

                  const isLeft = index % 2 === 0;

                  return (
                    <div
                      key={memory.id}
                      className="relative md:grid md:grid-cols-2 md:gap-16"
                    >

                      {/* Timeline dot */}

                      <div className="absolute left-5 top-8 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-green-200 bg-green-800 md:left-1/2" />

                      {/* Card */}

                      <div
                        className={`
                          ml-12 md:ml-0
                          ${isLeft ? "md:col-start-1" : "md:col-start-2"}
                        `}
                      >

                        <Link
                          href={`/memories/${memory.id}`}
                          className="group block rounded-3xl bg-white p-7 shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >

                          <div className="flex items-start gap-5">

                            <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
                              {memory.emoji || "📸"}
                            </div>

                            <div className="flex-1">

                              <p className="font-bold text-green-700 text-lg">
                                {memory.year}
                              </p>

                              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                                {memory.title}
                              </h2>

                              {memory.location && (
                                <p className="mt-2 text-sm font-semibold text-green-700">
                                  📍 {memory.location}
                                </p>
                              )}

                              <p className="mt-4 leading-7 text-gray-600">
                                {memory.description}
                              </p>

                              <p className="mt-5 font-semibold text-green-700">
                                View memory →
                              </p>

                            </div>

                          </div>

                        </Link>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          ) : (

            <div className="rounded-3xl bg-white p-16 text-center shadow-2xl">

              <div className="text-7xl mb-6">
                📅
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                The timeline is waiting.
              </h2>

              <p className="mt-4 text-lg text-gray-600">
                Add memories through the Admin Dashboard and they'll appear
                here automatically.
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