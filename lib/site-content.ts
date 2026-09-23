import { supabase } from "@/lib/supabase";

export type SiteContent = {
  brand: { name: string; icon: string; footerDescription: string };
  navigation: { label: string; href: string }[];
  home: {
    eyebrow: string; title: string; accent: string; intro: string; heroImage: string;
    galleryButton: string; timelineButton: string; latestEyebrow: string; latestTitle: string;
    photosEyebrow: string; photosTitle: string; timelineEyebrow: string; timelineTitle: string;
    timelineDescription: string; timelineCta: string;
  };
  pages: Record<string, { eyebrow: string; title: string; description: string }>;
};

export const defaultSiteContent: SiteContent = {
  brand: {
    name: "Home Archive",
    icon: "🌿",
    footerDescription: "Preserving the story of our home for generations to come.",
  },
  navigation: [
    { label: "Home", href: "/" }, { label: "Gallery", href: "/gallery" },
    { label: "Estate Map", href: "/map" }, { label: "Timeline", href: "/timeline" },
    { label: "About", href: "/about" }, { label: "Memories", href: "/memories" },
  ],
  home: {
    eyebrow: "Home Archive", title: "Where our", accent: "memories grow.",
    intro: "A living archive of our home, garden, family and the moments that make this place ours.",
    heroImage: "/hero.jpg", galleryButton: "Explore Gallery →", timelineButton: "View Timeline",
    latestEyebrow: "Recently added", latestTitle: "Latest Memories", photosEyebrow: "From the archive",
    photosTitle: "Photo Spotlight", timelineEyebrow: "The story continues",
    timelineTitle: "Every year adds another chapter.", timelineCta: "Explore the Timeline →",
    timelineDescription: "Explore how the estate has changed, grown and collected memories over time.",
  },
  pages: {
    gallery: { eyebrow: "Home Archive", title: "The Gallery", description: "A collection of moments, places and details from the home we love." },
    memories: { eyebrow: "Home Archive", title: "Our Memories", description: "Every chapter, gathered in one place." },
    timeline: { eyebrow: "Home Archive", title: "The Timeline", description: "Follow the story of the home as it grows." },
    map: { eyebrow: "Home Archive", title: "Explore the Estate", description: "Choose a place to discover the memories held there." },
    about: { eyebrow: "About Home Archive", title: "A home is made of stories.", description: "Home Archive is a place to preserve the memories, changes and everyday details that make a house feel like home." },
    creators: { eyebrow: "Home Archive", title: "Made by the people who call it home.", description: "Home Archive is a family project created to preserve the places and memories that matter most." },
  },
};

function mergeContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object") return defaultSiteContent;
  const incoming = value as Partial<SiteContent>;
  return {
    ...defaultSiteContent,
    ...incoming,
    brand: { ...defaultSiteContent.brand, ...incoming.brand },
    home: { ...defaultSiteContent.home, ...incoming.home },
    pages: { ...defaultSiteContent.pages, ...incoming.pages },
    navigation: Array.isArray(incoming.navigation) ? incoming.navigation : defaultSiteContent.navigation,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "site")
      .maybeSingle();
    return mergeContent(data?.content);
  } catch {
    // The site remains usable before the optional CMS table is installed.
    return defaultSiteContent;
  }
}

export { mergeContent };
