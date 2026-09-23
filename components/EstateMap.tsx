import Link from "next/link";

const locations = [
  {
    slug: "house",
    name: "House",
    emoji: "🏡",
    position: "left-[45%] top-[42%]",
  },
  {
    slug: "gate",
    name: "Gate",
    emoji: "🚪",
    position: "bottom-10 left-[48%]",
  },
  {
    slug: "mango-tree",
    name: "Mango Tree",
    emoji: "🌳",
    position: "top-20 left-24",
  },
  {
    slug: "garden",
    name: "Garden",
    emoji: "🌱",
    position: "right-24 top-36",
  },
  {
    slug: "driveway",
    name: "Driveway",
    emoji: "🚗",
    position: "bottom-28 right-20",
  },
];

export default function EstateMap() {
  return (
    <section className="bg-[#eef8ef] py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-16">

          <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-4">
            Explore
          </p>

          <h2 className="text-5xl font-bold text-green-900 mb-6">
            Explore Our Estate
          </h2>

          <p className="text-gray-600 text-lg">
            Click a location to explore its history and memories.
          </p>

        </div>

        <div className="relative mx-auto h-[700px] max-w-5xl rounded-3xl bg-green-100 border-4 border-green-300 shadow-2xl overflow-hidden">

          {/* Decorative paths */}

          <div className="absolute left-1/2 top-0 h-full w-8 -translate-x-1/2 bg-green-200/60 rounded-full" />

          <div className="absolute left-0 top-1/2 h-8 w-full -translate-y-1/2 bg-green-200/60 rounded-full" />

          {/* Locations */}

          {locations.map((location) => (
            <Link
              key={location.slug}
              href={`/map/${location.slug}`}
              className={`absolute ${location.position} rounded-full bg-green-700 text-white px-5 py-3 font-semibold shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-800 hover:shadow-2xl`}
            >
              {location.emoji} {location.name}
            </Link>
          ))}

        </div>

        <div className="text-center mt-10">

          <p className="text-gray-500">
            Select a location to see memories connected to that part of the estate.
          </p>

        </div>

      </div>
    </section>
  );
}