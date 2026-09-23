import Link from "next/link";
import { defaultSiteContent } from "@/lib/site-content";
import MobileMenu from "@/components/MobileMenu";

export default function Navbar() {
  const content = defaultSiteContent;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/20 bg-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 py-4 md:px-10 md:py-6">
        {/* LOGO */}
        <Link
          href="/"
          className="text-xl font-bold text-white transition hover:text-green-300 md:text-2xl"
        >
          {content.brand.icon} {content.brand.name}
        </Link>

        {/* DESKTOP NAV */}
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

        {/* MOBILE NAV */}
        <MobileMenu navigation={content.navigation} />
      </div>
    </nav>
  );
}