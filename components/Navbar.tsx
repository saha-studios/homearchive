import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";

export default async function Navbar() {
  const content = await getSiteContent();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-white transition hover:text-green-300 md:text-2xl"
        >
          {content.brand.icon} {content.brand.name}
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 text-lg font-medium text-white md:flex">
          {content.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition duration-300 hover:-translate-y-0.5 hover:text-green-300"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <input
            type="checkbox"
            id="mobile-menu"
            className="peer hidden"
          />

          <label
            htmlFor="mobile-menu"
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 transition hover:bg-white/20"
            aria-label="Open navigation menu"
          >
            <span className="h-0.5 w-6 rounded-full bg-white" />
            <span className="h-0.5 w-6 rounded-full bg-white" />
            <span className="h-0.5 w-6 rounded-full bg-white" />
          </label>

          {/* Mobile navigation */}
          <div className="pointer-events-none invisible absolute left-0 right-0 top-full translate-y-[-10px] border-b border-white/10 bg-black/90 px-5 py-5 opacity-0 backdrop-blur-xl transition-all duration-300 peer-checked:pointer-events-auto peer-checked:visible peer-checked:translate-y-0 peer-checked:opacity-100">
            <div className="flex flex-col gap-2">
              {content.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-5 py-4 text-lg font-medium text-white transition hover:bg-white/10 hover:text-green-300"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}