import Link from "next/link";
import Image from "next/image";
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

      <div className="space-y-12 sm:space-y-16">
        <header className="max-w-2xl space-y-3 pt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Журнал</p>
          <h1 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] font-normal leading-[1.05] tracking-tight">
            Материалы о свете, ткани и сценариях окна
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Спокойные разборы фактур, плотности и интерьерных сценариев, которые помогают выбрать ткань без магазинного шума.
          </p>
        </header>

        {guides.length === 0 ? (
          <p className="text-sm text-muted-foreground">Материалы пока не опубликованы.</p>
        ) : (
          <section className="grid gap-x-6 gap-y-12 sm:grid-cols-2 sm:gap-y-16">
            {guides.map((guide, index) => {
              const description = extractGuideDescription(guide);
              const headline = extractGuideHeadline(guide);
              const image = extractGuideImage(guide);

              return (
                <article key={guide.id} className="group">
                  {image && (
                    <Link href={guide.slug} className="relative block aspect-[4/3] overflow-hidden">
                      <Image
                        src={image}
                        alt={headline}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index === 0}
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                    </Link>
                  )}
                  <div className="space-y-2 pt-4">
                    <h2 className="font-serif text-[1.2rem] font-normal leading-tight tracking-tight sm:text-[1.35rem]">
                      <Link href={guide.slug} className="transition-colors hover:text-foreground/70">
                        {guide.title}
                      </Link>
                    </h2>
                    {description && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    )}
                    <Link
                      href={guide.slug}
                      className="inline-block pt-1 text-[11px] uppercase tracking-[0.12em] text-foreground/60 transition-colors hover:text-foreground"
                    >
                      Читать
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
