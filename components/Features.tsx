export default function Features() {
  return (
    <section className="bg-gradient-to-br from-white to-green-50 text-gray-900 py-24 px-8">
      <h2 className="text-5xl font-bold text-center mb-16">
        Everything About Our Home
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">

        <div className="rounded-3xl bg-gradient-to-br from-white to-green-50 shadow-2xl p-8 hover:hover:-translate-y-4 hover:rotate-1 hover:shadow-green-300/30 hover:shadow-2xl transition-all duration-300">
          <div className="text-5xl mb-4">📸</div>
          <h3 className="text-2xl font-bold mb-3">Gallery</h3>
          <p>Browse photos of the estate throughout the years.</p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-green-50 shadow-2xl p-8 hover:hover:-translate-y-4 hover:rotate-1 hover:shadow-green-300/30 hover:shadow-2xl transition-all duration-300">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="text-2xl font-bold mb-3">Garden Tracker</h3>
          <p>Watch plants grow and record important milestones.</p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-green-50 shadow-2xl p-8 hover:hover:-translate-y-4 hover:rotate-1 hover:shadow-green-300/30 hover:shadow-2xl transition-all duration-300">
          <div className="text-5xl mb-4">🎥</div>
          <h3 className="text-2xl font-bold mb-3">Video Archive</h3>
          <p>Store drone footage and family memories.</p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-white to-green-50 shadow-2xl p-8 hover:hover:-translate-y-4 hover:rotate-1 hover:shadow-green-300/30 hover:shadow-2xl transition-all duration-300">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-3">Timeline</h3>
          <p>Follow the story of the estate from year to year.</p>
        </div>

      </div>
    </section>
  );
}