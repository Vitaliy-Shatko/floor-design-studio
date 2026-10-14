import { describe, expect, it } from "vitest";
import { catalogProducts, emptyFilters, filterProducts, formatThickness, floorTypes } from "@/lib/catalog";

describe("catalog", () => {
  it("has 2 products per floor type", () => {
    for (const t of floorTypes) expect(catalogProducts.filter(p => p.type === t)).toHaveLength(2);
  });
  it("filters by price range inclusively", () => {
    const r = filterProducts(catalogProducts, { ...emptyFilters, minPrice: 2000, maxPrice: 2500 });
    expect(r.map(p => p.id).sort()).toEqual(["l2", "q1", "v2"]);
  });
  it("filters by stock = no", () => {
    expect(filterProducts(catalogProducts, { ...emptyFilters, stock: "no" }).every(p => !p.inStock)).toBe(true);
  });
  it("converts mm to inches", () => {
    expect(formatThickness(25.4, "in")).toBe("1.00″");
  });
});
