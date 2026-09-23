import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

const albums = {
  renovation: {
    title: "Renovation 2026",
    description: "The complete renovation journey.",
    label: "Renovation",
    images: [
      "/gallery/renovation/1.jpg",
      "/gallery/renovation/2.jpg",
      "/gallery/renovation/3.jpg",
      "/gallery/renovation/4.jpg",
    ],
  },

  garden: {
    title: "Garden",
    description: "Plants, flowers and growth around the estate.",
    label: "Nature",
    images: [
      "/gallery/garden/1.jpg",
      "/gallery/garden/2.jpg",
      "/gallery/garden/3.jpg",
      "/gallery/garden/4.jpg",
    ],
  },

  family: {
    title: "Family Memories",
    description: "Moments shared around the home.",
    label: "Family",
    images: [],
  },

  oldphotos: {
    title: "Old Photos",
    description: "Looking back through the history of the home.",
    label: "History",
    images: [],
  },
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const album = albums[slug as keyof typeof albums];

  if (!album) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-8">
          <div className="text-center">

            <p className="text-green-700 uppercase tracking-[0.3em] font-semibold mb-4">
              Home Archive
            </p>

            <h1 className="text-5xl font-bold text-green-950 mb-6">
              Album not found
            </h1>

            <Link
              href="/gallery"
              className="inline-block rounded-xl bg-green-900 text-white px-6 py-3 font-semibold hover:bg-green-800 transition"
            >
              ← Back to Gallery
            </Link>

          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f5f1e8] px-8 pt-36 pb-28">

        <div className="max-w-7xl mx-auto">

          {/* BACK BUTTON */}

          <Link
            href="/gallery"
            className="inline-flex items-center text-green-700 font-semibold hover:text-green-950 transition"
          >
            ← Back to Gallery
          </Link>


          {/* HEADER */}

          <div className="mt-10 mb-14">

            <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
              {album.label}
            </p>

            <h1 className="text-6xl md:text-7xl font-bold text-green-950 leading-tight">
              {album.title}
            </h1>

            <p className="mt-5 max-w-2xl text-xl text-gray-600 leading-8">
              {album.description}
            </p>

          </div>


          {/* PHOTOS */}

          {album.images.length === 0 ? (

            <div className="rounded-[2rem] bg-white shadow-xl p-16 md:p-24 text-center">

              <div className="text-6xl mb-6">
                📸
              </div>

              <h2 className="text-3xl font-bold text-green-950 mb-4">
                Photos coming soon
              </h2>

              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                This part of the archive hasn't been filled yet. New memories
                can be added here as the collection grows.
              </p>

            </div>

          ) : (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {album.images.map((image, index) => (

                <div
                  key={image}
                  className="group overflow-hidden rounded-[2rem] bg-white shadow-xl"
                >

                  <div className="relative aspect-[4/3] overflow-hidden">

                    <Image
                      src={image}
                      alt={`${album.title} photograph ${index + 1}`}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />

                  </div>

                  <div className="p-5">

                    <p className="text-sm uppercase tracking-[0.2em] text-green-700 font-semibold">
                      {album.label}
                    </p>

                    <p className="mt-1 text-gray-600">
                      Photograph {index + 1}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      <Footer />
    </>
  );
}