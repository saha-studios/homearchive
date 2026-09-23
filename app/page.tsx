import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EstateMap from "@/components/EstateMap";
import { supabase } from "@/lib/supabase";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const content = await getSiteContent();
  const { data: memories } = await supabase
    .from("memories")
    .select("*")
    .order("year", { ascending: false })
    .limit(3);

  const { data: photos } = await supabase
    .from("memory_photos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <>
      <Navbar />

      <main className="bg-[#031d0f]">

      {/* HERO */}

<section className="relative min-h-screen overflow-hidden flex items-center">

  {/* HERO IMAGE */}
  <img
    src={content.home.heroImage}
    alt={content.brand.name}
    className="absolute inset-0 h-full w-full object-cover"
  />

  {/* Dark overlay so text is readable */}
  <div className="absolute inset-0 bg-black/30" />

  <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-20 w-full">

    <div className="max-w-3xl">

      <p className="uppercase tracking-[0.35em] text-white/90 font-semibold mb-6">
        {content.home.eyebrow}
      </p>

      <h1 className="text-6xl md:text-8xl font-bold text-white leading-[0.95]">
        {content.home.title}
        <br />
        <span className="text-green-200">
          {content.home.accent}
        </span>
      </h1>

      <p className="mt-8 max-w-2xl text-xl md:text-2xl leading-9 text-white">
        {content.home.intro}
      </p>

      <div className="mt-10 flex flex-wrap gap-4">

        <Link
          href="/gallery"
          className="rounded-xl bg-white px-7 py-4 font-bold text-green-950 shadow-xl transition hover:-translate-y-1"
        >
          {content.home.galleryButton}
        </Link>

        <Link
          href="/timeline"
          className="rounded-xl border border-white/40 bg-black/20 px-7 py-4 font-bold text-white backdrop-blur-md transition hover:bg-black/30"
        >
          {content.home.timelineButton}
        </Link>

      </div>

    </div>

  </div>

</section>

        {/* LATEST MEMORIES */}

        <section className="bg-[#f5faf5] py-28 px-8">

          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">

              <div>

                <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-3">
                  {content.home.latestEyebrow}
                </p>

                <h2 className="text-5xl font-bold text-green-950">
                  {content.home.latestTitle}
                </h2>

              </div>

              <Link
                href="/memories"
                className="font-bold text-green-700 hover:text-green-900"
              >
                View all memories →
              </Link>

            </div>

            {memories && memories.length > 0 ? (

              <div className="grid md:grid-cols-3 gap-8">

                {memories.map((memory) => (

                  <Link
                    key={memory.id}
                    href={`/memories/${memory.id}`}
                    className="group rounded-3xl bg-white p-8 shadow-xl transition hover:-translate-y-2"
                  >

                    <div className="text-6xl mb-6">
                      {memory.emoji || "📸"}
                    </div>

                    <p className="font-bold text-green-700">
                      {memory.year}
                    </p>

                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {memory.title}
                    </h3>

                    {memory.location && (
                      <p className="text-green-700 mt-3">
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

              <div className="rounded-3xl bg-white p-12 text-center shadow-xl">

                <div className="text-6xl">
                  🌱
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mt-5">
                  Our archive is just beginning.
                </h3>

                <p className="text-gray-600 mt-3">
                  Add your first memory from the Admin Dashboard.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* PHOTO SPOTLIGHT */}

        <section className="bg-[#eef8ef] py-28 px-8">

          <div className="max-w-7xl mx-auto">

            <div className="flex items-end justify-between mb-12">

              <div>

                <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-3">
                  {content.home.photosEyebrow}
                </p>

                <h2 className="text-5xl font-bold text-green-950">
                  {content.home.photosTitle}
                </h2>

              </div>

              <Link
                href="/gallery"
                className="hidden md:block font-bold text-green-700 hover:text-green-900"
              >
                View gallery →
              </Link>

            </div>

            {photos && photos.length > 0 ? (

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                {photos.map((photo) => (

                  <Link
                    key={photo.id}
                    href={`/memories/${photo.memory_id}`}
                    className="group relative aspect-square overflow-hidden rounded-3xl bg-green-100 shadow-xl"
                  >

                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Home Archive photo"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">

                      <p className="font-semibold text-white">
                        {photo.caption || "View memory"}
                      </p>

                    </div>

                  </Link>

                ))}

              </div>

            ) : (

              <div className="rounded-3xl bg-white p-12 text-center shadow-xl">

                <div className="text-6xl">
                  📸
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mt-5">
                  Photos will appear here.
                </h3>

                <p className="text-gray-600 mt-3">
                  Upload photos through the Admin Dashboard.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* ESTATE MAP */}

        <EstateMap />

        {/* TIMELINE CTA */}

        <section className="bg-[#031d0f] py-28 px-8">

          <div className="max-w-5xl mx-auto text-center">

            <p className="uppercase tracking-[0.3em] text-green-400 font-semibold mb-4">
              {content.home.timelineEyebrow}
            </p>

            <h2 className="text-5xl md:text-6xl font-bold text-white">
              {content.home.timelineTitle}
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-green-100">
              {content.home.timelineDescription}
            </p>

            <Link
              href="/timeline"
              className="inline-block mt-10 rounded-xl bg-green-500 px-8 py-4 font-bold text-green-950 transition hover:-translate-y-1 hover:bg-green-400"
            >
              {content.home.timelineCta}
            </Link>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
