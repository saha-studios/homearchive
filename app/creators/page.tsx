import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const page = (await getSiteContent()).pages.creators;
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f5f1e8]">

        <section className="px-8 pt-36 pb-28">

          <div className="max-w-6xl mx-auto">

            <Link
              href="/about"
              className="text-green-700 font-semibold hover:text-green-900"
            >
              ← Back to About
            </Link>

            <div className="mt-12 grid md:grid-cols-2 gap-16 items-center">

              <div className="overflow-hidden rounded-[2.5rem] shadow-2xl">

                <img
                  src="/creators.jpg"
                  alt="The creators of Home Archive"
                  className="w-full aspect-[4/3] object-cover"
                />

              </div>

              <div>

                <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-5">
                  {page.eyebrow}
                </p>

                <h1 className="text-6xl md:text-7xl font-bold text-green-950 leading-[0.95]">
                  {page.title}
                </h1>

                <p className="mt-8 text-xl leading-9 text-gray-700">
                  {page.description}
                </p>

              </div>

            </div>

          </div>

        </section>

        <section className="bg-[#e8eee3] px-8 py-28">

          <div className="max-w-4xl mx-auto text-center">

            <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
              Our Story
            </p>

            <h2 className="text-5xl font-bold text-green-950">
              Built together.
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-gray-700">

              <p>
                This project brings together our family's memories,
                photographs and the history of the place we call home.
              </p>

              <p>
                We wanted to create somewhere that could show not only what
                the property looks like today, but how it has changed over
                time.
              </p>

              <p>
                Home Archive is our way of keeping those moments together —
                and making sure there are always more chapters to add.
              </p>

            </div>

          </div>

        </section>

        <section className="px-8 py-24">

          <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-green-950 p-12 md:p-20 text-center">

            <div className="text-6xl">
              🌿
            </div>

            <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
              The archive is still growing.
            </h2>

            <p className="mt-5 text-lg leading-8 text-green-100 max-w-2xl mx-auto">
              Every photograph, renovation, plant and memory adds another
              chapter to the story of our home.
            </p>

            <Link
              href="/gallery"
              className="inline-block mt-8 rounded-xl bg-white px-8 py-4 font-bold text-green-950 hover:-translate-y-1 transition"
            >
              Explore the Archive →
            </Link>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
