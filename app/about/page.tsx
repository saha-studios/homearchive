import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const page = (await getSiteContent()).pages.about;
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f5f1e8] text-green-950">

        {/* INTRO */}

        <section className="px-8 pt-36 pb-20">
          <div className="max-w-6xl mx-auto">

            <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
              {page.eyebrow}
            </p>

            <h1 className="text-6xl md:text-8xl font-bold leading-[0.95]">
              {page.title}
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-gray-700">
              {page.description}
            </p>

          </div>
        </section>


        {/* THEN & NOW */}

        <section className="px-8 py-20">

          <div className="max-w-7xl mx-auto">

            <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
              Then & Now
            </p>

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Look how far we've come.
            </h2>

            <p className="max-w-3xl text-lg leading-8 text-gray-600 mb-12">
              A home changes with time. These photographs capture two moments
              in that story — where we started and where we are today.
            </p>


            <div className="grid md:grid-cols-2 gap-8">

              {/* OLD PHOTO */}

              <div className="group">

                <div className="relative overflow-hidden rounded-[2rem] shadow-2xl aspect-[4/3]">

                  <img
                    src="/old-home.jpg"
                    alt="Our home in the past"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-24">

                    <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                      Then
                    </p>

                    <h3 className="text-3xl font-bold text-white mt-2">
                      The way it was
                    </h3>

                  </div>

                </div>

              </div>


              {/* CURRENT PHOTO */}

              <div className="group">

                <div className="relative overflow-hidden rounded-[2rem] shadow-2xl aspect-[4/3]">

                  <img
                    src="/current-home.jpg"
                    alt="Our home today"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8 pt-24">

                    <p className="text-sm uppercase tracking-[0.3em] text-white/80">
                      Now
                    </p>

                    <h3 className="text-3xl font-bold text-white mt-2">
                      Where we are today
                    </h3>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* WHY HOME ARCHIVE EXISTS */}

        <section className="bg-[#e5eee1] px-8 py-28">

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

            <div>

              <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
                The idea
              </p>

              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                More than just a collection of photos.
              </h2>

            </div>

            <div className="space-y-6 text-lg leading-8 text-gray-700">

              <p>
                Our home is always changing. The garden grows, projects get
                completed, spaces are improved and new memories are made.
              </p>

              <p>
                Home Archive was created to keep track of all those changes
                and give them a permanent place to live.
              </p>

              <p>
                Instead of letting important moments get buried in a camera
                roll, this archive lets us look back and see how our home has
                grown over time.
              </p>

            </div>

          </div>

        </section>


        {/* CREATOR */}

        <section className="px-8 py-28">

          <div className="max-w-6xl mx-auto">

            <div className="mb-14">

              <p className="uppercase tracking-[0.3em] text-green-700 font-semibold mb-4">
                The Creator
              </p>

              <h2 className="text-5xl md:text-6xl font-bold">
                Meet the person behind Home Archive.
              </h2>

            </div>


            <div className="grid md:grid-cols-2 gap-14 items-center">

              {/* CREATOR PHOTO */}

              <div className="overflow-hidden rounded-[2rem] shadow-2xl">

                <img
                  src="/creator.jpg"
                  alt="The creator of Home Archive"
                  className="w-full aspect-[4/3] object-cover"
                />

              </div>


              {/* CREATOR TEXT */}

              <div>

                <p className="text-green-700 font-semibold text-lg mb-3">
                  Creator & Developer
                </p>

                <h3 className="text-4xl md:text-5xl font-bold">
                  Saha
                </h3>

                <div className="mt-7 space-y-5 text-lg leading-8 text-gray-700">

                  <p>
                    Home Archive was created as a way to turn the story of
                    our home into something that could actually be explored.
                  </p>

                  <p>
                    What started as an idea for keeping track of photographs
                    and changes around the property became a full digital
                    archive for memories, the garden, renovations and the
                    history of the estate.
                  </p>

                  <p>
                    The project is still growing, just like the home itself.
                    There will always be another photograph, another memory
                    and another chapter to add.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FINAL SECTION */}

        <section className="bg-green-950 px-8 py-24">

          <div className="max-w-5xl mx-auto text-center">

            <div className="text-6xl mb-6">
              🌿
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white">
              The story isn't finished.
            </h2>

            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-green-100">
              Home Archive will keep growing as the home grows.
              Every new memory becomes another part of its history.
            </p>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
