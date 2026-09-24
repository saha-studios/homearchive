import { defaultSiteContent } from "@/lib/site-content";

export default function Footer() {
  const content = defaultSiteContent;

  return (
    <footer className="bg-[#06180d] text-green-100 py-16">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-3">
            {content.brand.icon} {content.brand.name}
          </h2>

          <p className="max-w-md text-green-300">
            {content.brand.footerDescription}
          </p>
        </div>

        <div className="mt-10 space-y-2 md:mt-0">
          {content.navigation.slice(1).map((item) => (
            <p key={item.href}>{item.label}</p>
          ))}
        </div>
      </div>
    </footer>
  );
}