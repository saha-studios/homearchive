import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      <Image
        src="/images/hero.jpg"
        alt="Home Estate"
        fill
        priority
        sizes="100vw"
        quality={75}
        className="object-cover"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-8xl">
          Home Archive
        </h1>

        <p className="mb-10 max-w-3xl text-lg text-green-100 sm:text-xl md:text-2xl">
          Preserving our home's story, one season at a time.
        </p>

        <button className="rounded-full bg-white px-8 py-4 text-lg font-bold text-green-900 shadow-2xl transition hover:scale-105 sm:px-10 sm:py-5 sm:text-xl">
          Explore the Estate →
        </button>
      </div>
    </section>
  );
}