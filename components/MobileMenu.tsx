"use client";

import Link from "next/link";
import { useState } from "react";

type NavigationItem = {
  href: string;
  label: string;
};

export default function MobileMenu({
  navigation,
}: {
  navigation: NavigationItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
      >
        <div className="flex flex-col gap-1.5">
          <span
            className={`block h-0.5 w-6 rounded-full bg-white transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded-full bg-white transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 rounded-full bg-white transition ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full border-t border-white/10 bg-black/95 px-5 py-4 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-5 py-4 text-lg font-medium text-white transition hover:bg-white/10 hover:text-green-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}