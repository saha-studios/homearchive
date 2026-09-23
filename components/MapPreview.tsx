export default function MapPreview() {
  return (
    <section className="bg-[#eef7ef] py-32 px-8">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center text-gray-900 mb-6">
          Explore The Estate
        </h2>

        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16 text-lg">
          Soon you'll be able to click different areas of the property to
          explore their history, photos, projects and memories.
        </p>

        <div className="relative rounded-3xl overflow-hidden bg-green-200 h-[600px] shadow-2xl">

          <div className="absolute inset-0 flex items-center justify-center text-2xl text-green-900 font-bold">
            Estate Map Coming Soon 🌿
          </div>

          {/* Example pins */}

          <button className="absolute top-[25%] left-[35%] w-5 h-5 bg-red-500 rounded-full hover:scale-150 transition" />

          <button className="absolute top-[55%] left-[60%] w-5 h-5 bg-red-500 rounded-full hover:scale-150 transition" />

          <button className="absolute top-[72%] left-[20%] w-5 h-5 bg-red-500 rounded-full hover:scale-150 transition" />

        </div>

      </div>
    </section>
  );
}