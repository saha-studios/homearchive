import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const events = [
  {
    year: "2024",
    title: "The Beginning",
    description:
      "The estate started its journey with the first plans and ideas.",
  },
  {
    year: "2025",
    title: "Garden Expansion",
    description:
      "New flowers, trees and landscaping transformed the property.",
  },
  {
    year: "2026",
    title: "Major Renovation",
    description:
      "The biggest renovation project brought new life to the home.",
  },
  {
    year: "Future",
    title: "What's Next?",
    description:
      "Every future memory, project and milestone will continue to be added here.",
  },
];

export default async function TimelinePage() {
  const page = (await getSiteContent()).pages.timeline;
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32 pb-24 px-8">

        <div className="max-w-5xl mx-auto">

          <h1 className="text-6xl font-bold text-white mb-4">
            {page.title}
          </h1>

          <p className="text-green-100 text-xl mb-20">
            {page.description}
          </p>

          <div className="relative border-l-4 border-green-400 pl-10 space-y-16">

            {events.map((event) => (
              <div key={event.year} className="relative">

                <div className="absolute -left-[54px] top-1 w-8 h-8 rounded-full bg-green-400 border-4 border-white"></div>

                <div className="bg-white rounded-3xl p-8 shadow-2xl">

                  <span className="text-green-700 font-bold text-lg">
                    {event.year}
                  </span>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-4">
                    {event.title}
                  </h2>

                  <p className="text-gray-600 text-lg">
                    {event.description}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}
