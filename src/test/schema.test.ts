import { describe, expect, it } from "vitest";
import { catalogProducts } from "@/lib/catalog";
import { breadcrumbSchema, catalogSchema, faqSchema, serializeSchema } from "@/lib/schema";

describe("schema", () => {
  it("escapes opening angle brackets without corrupting data", () => {
    const json = serializeSchema({ text: "</script>опасно" });
    expect(json).not.toContain("</script>");
    expect(JSON.parse(json).text).toBe("</script>опасно");
  });
  it("builds FAQPage from faq items", () => {
    const s = faqSchema([{ q: "Вопрос?", a: "Ответ." }]);
    expect(s["@type"]).toBe("FAQPage");
    expect(s["@context"]).toBe("https://schema.org");
    expect(s.mainEntity).toHaveLength(1);
    expect(s.mainEntity[0]).toMatchObject({
      "@type": "Question",
      name: "Вопрос?",
      acceptedAnswer: { "@type": "Answer", text: "Ответ." },
    });
  });
  it("builds ItemList of products with RUB offers", () => {
    const s = catalogSchema(catalogProducts);
    expect(s["@type"]).toBe("ItemList");
    expect(s.itemListElement).toHaveLength(catalogProducts.length);
    const first = s.itemListElement[0]!.item;
    expect(first["@type"]).toBe("Product");
    expect(first.offers.priceCurrency).toBe("RUB");
    expect(first.offers.price).toBe(catalogProducts[0]!.price);
  });
  it("marks availability from stock flag", () => {
    const availability = catalogSchema(catalogProducts).itemListElement.map(
      (e) => e.item.offers.availability,
    );
    const outOfStock = availability.filter((a) => a === "https://schema.org/OutOfStock");
    expect(outOfStock).toHaveLength(catalogProducts.filter((p) => !p.inStock).length);
  });
  it("builds BreadcrumbList with absolute item urls except the last crumb", () => {
    const s = breadcrumbSchema([{ name: "Главная", path: "/" }, { name: "Каталог" }]);
    expect(s["@type"]).toBe("BreadcrumbList");
    expect(s.itemListElement[0]).toEqual({
      "@type": "ListItem",
      position: 1,
      name: "Главная",
      item: "https://example.com/",
    });
    expect(s.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Каталог",
    });
  });
});
