import Link from "next/link";
import type { Metadata } from "next";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import {
  buildBreadcrumbJsonLd,
  buildStorefrontMetadata,
  jsonLd,
  resolveAbsoluteUrl
} from "@/lib/seo";
import {
  extractGuideDescription,
  extractGuideHeadline,
  extractGuideImage,
  getGuidePages
} from "@/lib/guides";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStorefrontConfig();

  return buildStorefrontMetadata(config, {
    title: `Журнал — ${config.shop.name}`,
    description:
      "Журнал Velura: материалы о свете, ткани, сценариях окна и подборе текстиля для разных пространств.",
    path: "/guides",
    image: config.seo.openGraphImage
  });
}

export default async function GuidesPage() {
  const config = await getStorefrontConfig();
  const guides = getGuidePages(config.pages);

  const schemas = [
    buildBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Журнал", path: "/guides" }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Журнал ${config.shop.name}`,
      description:
        "Подборка материалов о шторах, тюле, сценариях света и подборе ткани.",
      url: resolveAbsoluteUrl("/guides"),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: guides.map((guide, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: resolveAbsoluteUrl(guide.slug),
          name: guide.title
        }))
      }
    }
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`guides-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      ))}

      <div className="space-y-6">
        <header className="rounded-xl border border-border/34 bg-card/90 px-5 py-6 sm:px-6 sm:py-7">
          <p className="ui-kicker">Журнал Velura</p>
          <h1 className="ui-title-display mt-2 text-[clamp(2rem,4.2vw,3.2rem)] leading-[0.96]">
            Материалы о свете, ткани и сценариях окна
          </h1>
          <p className="ui-subtle mt-3 max-w-3xl text-sm sm:text-base">
            Спокойные разборы фактур, плотности и интерьерных сценариев, которые помогают выбрать ткань без магазинного шума.
          </p>
        </header>

        {guides.length === 0 ? (
          <section className="rounded-xl border border-border/34 bg-card/90 px-5 py-8 sm:px-6">
            <p className="ui-subtle">Материалы пока не опубликованы.</p>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => {
              const description = extractGuideDescription(guide);
              const headline = extractGuideHeadline(guide);
              const image = extractGuideImage(guide);

              return (
                <article
                  key={guide.id}
                  className="group overflow-hidden rounded-xl border border-border/34 bg-card/88"
                >
                  {image && (
                    <Link href={guide.slug} className="block overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={headline}
                        className="h-[280px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    </Link>
                  )}
                  <div className="space-y-2 px-4 py-4 sm:px-5">
                    <h2 className="ui-title-serif text-[1.38rem] leading-tight">
                      <Link href={guide.slug} className="hover:text-foreground/90">
                        {guide.title}
                      </Link>
                    </h2>
                    {description && (
                      <p className="ui-subtle line-clamp-3 text-sm leading-relaxed">{description}</p>
                    )}
                    <Link href={guide.slug} className="inline-flex pt-1 text-sm font-medium">
                      Читать материал
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}
