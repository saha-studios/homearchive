import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";

export default async function Navbar() {
  const content = await getSiteContent();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6 backdrop-blur-xl bg-black/20 border-b border-white/20">

      <Link href="/" className="text-2xl font-bold">
        {content.brand.icon} {content.brand.name}
      </Link>

      <div className="hidden gap-8 text-lg font-medium md:flex">
        {content.navigation.map((item) => (
          <Link key={item.href} href={item.href} className="transition duration-300 hover:scale-105 hover:text-green-300">
            {item.label}
          </Link>
        ))}
      </div>

    </nav>
  );
}
