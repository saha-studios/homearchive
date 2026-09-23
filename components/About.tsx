import Link from "next/link";

export default function About() {
  return (
    <section className="bg-[#eef8ef] py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-4">
              About Home Archive
            </p>

            <h2 className="text-5xl md:text-6xl font-bold text-green-950 leading-tight">
              A home with a story worth remembering.
            </h2>
          </div>

          <div>
            <p className="text-gray-700 text-lg leading-8 mb-6">
              Home Archive is a living record of our home, our garden, and
              everything that happens around the estate.
            </p>

            <p className="text-gray-600 text-lg leading-8 mb-8">
              From everyday moments to major changes, every photo and memory
              becomes part of the story. As the years pass, the archive grows
              with it.
            </p>

            <Link
              href="/about"
              className="inline-block rounded-xl bg-green-700 px-7 py-4 font-bold text-white hover:bg-green-800 transition"
            >
              Learn More About the Archive →
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}