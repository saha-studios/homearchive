import Link from "next/link";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import EstateMap from "@/components/EstateMap";
import Timeline from "@/components/Timeline";
import MemorySpotlight from "@/components/MemorySpotlight";
import GalleryPreview from "@/components/GalleryPreview";
import Footer from "@/components/Footer";
import MapPreview from "@/components/MapPreview";
import LatestMemories from "@/components/LatestMemories";
import Progress from "@/components/Progress";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <Features />

        <About />

        <EstateMap />

        <Timeline />

        <MemorySpotlight />

        <GalleryPreview />

        <MapPreview />

        <LatestMemories />

        <Progress />

        {/* ADMIN PORTAL */}
        <section className="bg-[#02150a] px-8 py-24">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-green-500/20 bg-gradient-to-br from-[#062b16] to-[#010a05] p-10 text-center shadow-2xl md:p-16">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-400/20 bg-green-500/10 text-3xl">
              ⚙️
            </div>

            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-green-400">
              Private Area
            </p>

            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Home Archive Admin
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-green-100/70">
              Manage memories, upload photos and videos, and keep the history
              of our home up to date.
            </p>

            <Link
              href="/admin"
              className="group mt-9 inline-flex items-center gap-3 rounded-2xl border border-green-400/30 bg-green-500/10 px-7 py-4 font-bold text-green-300 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-green-300/60 hover:bg-green-500/20 hover:text-white hover:shadow-green-900/40"
            >
              <span>Open Admin Portal</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/30">
              Authorized access only
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}