import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">

      <Image
        src="/images/hero.jpg"
        alt="Home Estate"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">

        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-6">
          Home Archive
        </h1>

        <p className="max-w-3xl text-xl md:text-2xl text-green-100 mb-10">
          Preserving our home's story, one season at a time.
        </p>

        <button className="rounded-full bg-white text-green-900 px-10 py-5 text-xl font-bold shadow-2xl hover:scale-105 transition">
          Explore the Estate →
        </button>

      </div>

    </section>
  );
}
