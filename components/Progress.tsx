import { supabase } from "@/lib/supabase";

export default async function Progress() {
  const { count: memoryCount } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true });

  const { count: photoCount } = await supabase
    .from("memory_photos")
    .select("*", { count: "exact", head: true });

  const { data: years } = await supabase
    .from("memories")
    .select("year")
    .order("year", { ascending: true });

  const uniqueYears = [
    ...new Set((years || []).map((memory) => memory.year)),
  ];

  const stats = [
    {
      number: memoryCount || 0,
      label: "Memories",
      emoji: "💭",
    },
    {
      number: photoCount || 0,
      label: "Photos",
      emoji: "📸",
    },
    {
      number: uniqueYears.length,
      label: "Years Documented",
      emoji: "📅",
    },
  ];

  return (
    <section className="bg-[#031d0f] py-24 px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">

          <p className="uppercase tracking-[0.3em] text-green-400 font-semibold mb-4">
            The Archive Grows
          </p>

          <h2 className="text-5xl md:text-6xl font-bold text-white">
            Our Progress
          </h2>

          <p className="text-green-100 text-lg mt-5 max-w-2xl mx-auto">
            Every memory added becomes another piece of our home's history.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-green-800 bg-green-950/60 p-10 text-center shadow-xl"
            >

              <div className="text-5xl mb-5">
                {stat.emoji}
              </div>

              <p className="text-5xl font-bold text-white">
                {stat.number}
              </p>

              <p className="text-green-200 text-lg mt-3">
                {stat.label}
              </p>

            </div>
          ))}

        </div>

        <div className="mt-10 rounded-3xl bg-green-900/50 border border-green-800 p-8 text-center">

          <p className="text-green-100 text-lg">
            🌿 The archive is always growing.
          </p>

          <p className="text-green-300 mt-2">
            Add another memory and watch the story continue.
          </p>

        </div>

      </div>
    </section>
  );
}