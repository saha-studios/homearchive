"use client";

import { useEffect, useState } from "react";
import { defaultSiteContent, mergeContent, type SiteContent } from "@/lib/site-content";
import { supabase } from "@/lib/supabase";

const pageLabels: Record<string, string> = {
  gallery: "Gallery", memories: "Memories", timeline: "Timeline", map: "Estate Map", about: "About", creators: "Creators",
};

export default function SiteStudio() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [status, setStatus] = useState("Loading your site content…");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_content").select("content").eq("id", "site").maybeSingle()
      .then(({ data, error }) => {
        setContent(mergeContent(data?.content));
        setStatus(error ? "Using the built-in copy. Run the CMS setup once to save changes for everyone." : "Ready to edit. Changes are published when you save.");
      });
  }, []);

  function update(path: string[], value: string) {
    setContent((previous) => {
      const next = structuredClone(previous) as Record<string, unknown>;
      let cursor = next;
      path.slice(0, -1).forEach((key) => { cursor = cursor[key] as Record<string, unknown>; });
      cursor[path.at(-1)!] = value;
      return next as SiteContent;
    });
  }

  async function save() {
    setSaving(true);
    setStatus("Publishing…");
    const { error } = await supabase.from("site_content").upsert({ id: "site", content, updated_at: new Date().toISOString() });
    setSaving(false);
    setStatus(error ? `Could not publish: ${error.message}. Check the CMS setup and your Supabase permissions.` : "Published. Refresh any public page to see the update.");
  }

  const field = (label: string, path: string[], multiline = false) => {
    let value: unknown = content;
    path.forEach((key) => { value = (value as Record<string, unknown>)[key]; });
    const props = { value: String(value ?? ""), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(path, event.target.value), className: "mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" };
    return <label className="block text-sm font-bold text-gray-700">{label}{multiline ? <textarea {...props} rows={4} /> : <input {...props} />}</label>;
  };

  return <section className="mt-12 rounded-3xl bg-white p-7 shadow-2xl md:p-10">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-green-700">Site studio</p><h2 className="mt-2 text-3xl font-bold text-gray-900">Edit every public page</h2><p className="mt-2 max-w-2xl text-gray-600">Change your brand, navigation, home page, and page headings here. Memory and photo editing stays above.</p></div>
      <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-50">{saving ? "Publishing…" : "Publish site changes"}</button>
    </div>
    <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{status}</p>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl bg-gray-50 p-5"><h3 className="text-xl font-bold text-gray-900">Brand & navigation</h3>{field("Site name", ["brand", "name"])}{field("Brand icon", ["brand", "icon"])}{field("Footer description", ["brand", "footerDescription"], true)}<p className="pt-2 text-sm text-gray-500">Navigation labels can be changed in the CMS record without needing a code edit.</p></div>
      <div className="space-y-4 rounded-2xl bg-gray-50 p-5"><h3 className="text-xl font-bold text-gray-900">Home page</h3>{field("Hero label", ["home", "eyebrow"])}{field("Hero title", ["home", "title"])}{field("Hero accent", ["home", "accent"])}{field("Hero description", ["home", "intro"], true)}{field("Hero image path or URL", ["home", "heroImage"])}{field("Gallery button", ["home", "galleryButton"])}{field("Timeline button", ["home", "timelineButton"])}{field("Latest memories title", ["home", "latestTitle"])}{field("Photo spotlight title", ["home", "photosTitle"])}{field("Timeline callout title", ["home", "timelineTitle"])}{field("Timeline callout description", ["home", "timelineDescription"], true)}{field("Timeline callout button", ["home", "timelineCta"])}</div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">{Object.entries(content.pages).map(([key]) => <div key={key} className="space-y-4 rounded-2xl border border-gray-100 p-5"><h3 className="text-xl font-bold text-gray-900">{pageLabels[key] ?? key}</h3>{field("Label", ["pages", key, "eyebrow"])}{field("Page title", ["pages", key, "title"])}{field("Description", ["pages", key, "description"], true)}</div>)}</div>
  </section>;
}
