import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EstateMap from "@/components/EstateMap";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const page = (await getSiteContent()).pages.map;
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#031d0f] via-[#0b4f2a] to-[#1b7a45] pt-32">

        <div className="text-center text-white mb-10">

          <h1 className="text-6xl font-bold">
            {page.title}
          </h1>

          <p className="text-green-100 text-xl mt-4">
            {page.description}
          </p>

        </div>

        <EstateMap />

      </main>

      <Footer />
    </>
  );
}
