import type { CatalogProduct } from "@/lib/catalog";

export type FaqItem = { q: string; a: string };

const SITE_NAME = "ПолМастер";
const SITE_URL = "https://example.com";

export function serializeSchema(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type QuestionSchema = {
  "@type": "Question";
  name: string;
  acceptedAnswer: { "@type": "Answer"; text: string };
};

export type FaqPageSchema = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: QuestionSchema[];
};

export function faqSchema(items: readonly FaqItem[]): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

type ProductSchema = {
  "@type": "Product";
  name: string;
  brand: { "@type": "Brand"; name: string };
  offers: {
    "@type": "Offer";
    priceCurrency: "RUB";
    price: number;
    availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
  };
};

export type CatalogSchema = {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  itemListElement: { "@type": "ListItem"; position: number; item: ProductSchema }[];
};

export type CrumbPath = "/" | "/catalog" | "/calculator" | "/faq" | "/about" | "/contacts";

export type Crumb = { name: string; path?: CrumbPath };

export type BreadcrumbListSchema = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: { "@type": "ListItem"; position: number; name: string; item?: string }[];
};

export function breadcrumbSchema(crumbs: readonly Crumb[]): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        ...(crumb.path && !isLast ? { item: `${SITE_URL}${crumb.path}` } : {}),
      };
    }),
  };
}

export function catalogSchema(products: readonly CatalogProduct[]): CatalogSchema {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Каталог напольных покрытий — ${SITE_NAME}`,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: `${p.type} ${p.title}`,
        brand: { "@type": "Brand", name: p.brand },
        offers: {
          "@type": "Offer",
          priceCurrency: "RUB",
          price: p.price,
          availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      },
    })),
  };
}
