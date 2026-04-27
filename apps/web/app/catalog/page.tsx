import type { Metadata } from "next";
import { fetchStorefrontConfig } from "@/lib/api-client";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildStorefrontMetadata,
  jsonLd
} from "@/lib/seo";
import { CatalogPageClient } from "./catalog-page-client";

type CatalogPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function hasActiveSearchParams(searchParams: CatalogPageProps["searchParams"]): boolean {
  if (!searchParams) {
    return false;
  }

  return Object.values(searchParams).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => entry.trim().length > 0);
    }

    return typeof value === "string" && value.trim().length > 0;
  });
}

export async function generateMetadata({
  searchParams
}: CatalogPageProps): Promise<Metadata> {
  const config = await fetchStorefrontConfig();
  const page = config.pages.find((item) => item.kind === "catalog" || item.slug === "/catalog");
  const title = page?.title ? `${page.title} — ${config.shop.name}` : `Каталог штор и тюля — ${config.shop.name}`;
  const description =
    page?.blocks.find((block) => block.type === "rich-text")?.content ??
    "Полная коллекция: льняные портьеры, бархатные шторы, воздушный тюль, комплекты day-night. Фильтр по типу, комнате и назначению.";

  return buildStorefrontMetadata(config, {
    title,
    description,
    path: "/catalog",
    noIndex: hasActiveSearchParams(searchParams)
  });
}

export default async function CatalogPage() {
  const config = await fetchStorefrontConfig();
  const page = config.pages.find((p) => p.kind === "catalog" || p.slug === "/catalog");

  if (!page) {
    return null;
  }

  const allTags = Array.from(new Set(config.catalog.products.flatMap((p) => p.tags ?? [])));
  const schemas = [
    buildBreadcrumbJsonLd([
      { name: "Главная", path: "/" },
      { name: "Каталог", path: "/catalog" }
    ]),
    buildCollectionPageJsonLd(
      config,
      config.catalog.products.filter((product) => product.isActive !== false),
      page.title
    )
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`catalog-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(schema)}
        />
      ))}
      <CatalogPageClient
        page={page}
        products={config.catalog.products}
        allTags={allTags}
      />
    </>
  );
}
