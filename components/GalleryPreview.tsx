import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Photo = {
  id: string;
  image_url: string;
  caption: string | null;
  memory_id: string;
};

type Memory = {
  id: string;
  title: string;
  year: number;
};

export default async function GalleryPreview() {
  const { data: photos } = await supabase
    .from("memory_photos")
    .select("id, image_url, caption, memory_id")
    .order("created_at", { ascending: false })
    .limit(6);

  const photoList = (photos || []) as Photo[];

  const memoryIds = photoList.map((photo) => photo.memory_id);

  let memories: Memory[] = [];

  if (memoryIds.length > 0) {
    const { data: memoryData } = await supabase
      .from("memories")
      .select("id, title, year")
      .in("id", memoryIds);

    memories = (memoryData || []) as Memory[];
  }

  return (
    <section className="bg-white py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">

          <div>
            <p className="uppercase tracking-[0.3em] text-green-600 font-semibold mb-4">
              Visual Archive
            </p>

            <h2 className="text-5xl font-bold text-green-950">
              From the Gallery
            </h2>

            <p className="text-gray-600 text-lg mt-4">
              A glimpse into the moments we've captured.
            </p>
          </div>

          <Link
            href="/gallery"
            className="rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 transition"
          >
            View Full Gallery →
          </Link>

        </div>

        {photoList.length > 0 ? (

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

            {photoList.map((photo) => {

              const memory = memories.find(
                (item) => item.id === photo.memory_id
              );

              return (
                <Link
                  key={photo.id}
                  href={`/memories/${photo.memory_id}`}
                  className="group relative overflow-hidden rounded-3xl bg-green-100"
                >

                  <img
                    src={photo.image_url}
                    alt={photo.caption || "Home Archive photo"}
                    className="h-64 md:h-80 w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16">

                    <p className="text-white font-bold">
                      {memory?.title || "Home Archive"}
                    </p>

                    <p className="text-white/80 text-sm mt-1">
                      {memory?.year || ""}
                    </p>

                  </div>

                </Link>
              );
            })}

          </div>

        ) : (

          <div className="rounded-3xl bg-green-50 p-16 text-center">

            <div className="text-7xl mb-5">
              📸
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Your gallery will appear here.
            </h3>

            <p className="text-gray-600 mt-3">
              Upload photos through the Admin Dashboard to start building it.
            </p>

          </div>

        )}

      </div>
    </section>
  );
}