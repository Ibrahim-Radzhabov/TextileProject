import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontConfig } from "@/lib/get-storefront-config";
import { renderNonProductGridBlock } from "@/lib/page-block-renderers";
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
  getGuidePages,
  renderableGuideBlocks,
  resolveGuidePageBySlug
} from "@/lib/guides";

type GuidePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const config = await getStorefrontConfig().catch(() => null);
  if (!config) {
    return [];
  }

  return getGuidePages(config.pages).map((page) => ({
    slug: page.slug.replace(/^\/guides\//, "")
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const config = await getStorefrontConfig();
  const page = resolveGuidePageBySlug(config.pages, decodeURIComponent(params.slug));
  if (!page) {
    return {};
  }

  const description = extractGuideDescription(page) || config.seo.description;
  const image = extractGuideImage(page) ?? config.seo.openGraphImage;

  return buildStorefrontMetadata(config, {
    title: `${page.title} — ${config.shop.name}`,
    description,
    path: page.slug,
    image
  });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const config = await getStorefrontConfig();
  const slug = decodeURIComponent(params.slug);
  const page = resolveGuidePageBySlug(config.pages, slug);

  if (!page) {
    notFound();
  }

  const description = extractGuideDescription(page) || config.seo.description;
  const headline = extractGuideHeadline(page);
  const image = extractGuideImage(page);
  const articleBlocks = renderableGuideBlocks(page.blocks);

  const schemas = [
    buildBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Журнал", path: "/guides" },
      { name: page.title, path: page.slug }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      name: headline,
      description,
      image: image ? [resolveAbsoluteUrl(image)] : undefined,
      mainEntityOfPage: resolveAbsoluteUrl(page.slug),
      author: {
        "@type": "Organization",
        name: config.shop.name
      },
      publisher: {
        "@type": "Organization",
        name: config.shop.name,
        logo: config.shop.logo?.src ? { "@type": "ImageObject", url: resolveAbsoluteUrl(config.shop.logo.src) } : undefined
      }
    }
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`guide-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      ))}

      <article className="space-y-6">
        <header className="rounded-xl border border-border/34 bg-card/90 px-5 py-6 sm:px-6 sm:py-7">
          <p className="ui-kicker">Журнал</p>
          <h1 className="ui-title-display mt-2 text-[clamp(2rem,4.2vw,3.2rem)] leading-[0.96]">
            {page.title}
          </h1>
          <p className="ui-subtle mt-3 max-w-3xl text-sm sm:text-base">{description}</p>
        </header>

        <div className="space-y-6">
          {articleBlocks.map((block) => (
            <div key={block.id}>{renderNonProductGridBlock(block)}</div>
          ))}
        </div>
      </article>
    </>
  );
}
