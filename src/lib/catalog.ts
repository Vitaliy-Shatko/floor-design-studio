export const floorTypes = ["Ламинат", "Паркетная доска", "Виниловый пол", "Кварц-винил", "Инженерная доска", "Пробковое покрытие"] as const;
export type FloorType = (typeof floorTypes)[number];

export type CatalogProduct = {
  id: string; title: string; type: FloorType; brand: string; price: number;
  inStock: boolean; wearClass: string; waterproof: boolean; thicknessMm: number; image: string;
};

export const catalogProducts: CatalogProduct[] = [
  { id: "l1", title: "Дуб Альпийский", type: "Ламинат", brand: "Kronospan", price: 1290, inStock: true, wearClass: "33", waterproof: false, thicknessMm: 8, image: "laminate" },
  { id: "l2", title: "Орех Классик", type: "Ламинат", brand: "Quick-Step", price: 2150, inStock: false, wearClass: "34", waterproof: true, thicknessMm: 12, image: "laminate" },
  { id: "p1", title: "Дуб Натур", type: "Паркетная доска", brand: "Tarkett", price: 3890, inStock: true, wearClass: "32", waterproof: false, thicknessMm: 14, image: "parquet" },
  { id: "p2", title: "Ясень Белый", type: "Паркетная доска", brand: "Barlinek", price: 4590, inStock: true, wearClass: "33", waterproof: false, thicknessMm: 14, image: "parquet" },
  { id: "v1", title: "Серый Туман", type: "Виниловый пол", brand: "Tarkett", price: 1790, inStock: true, wearClass: "32", waterproof: true, thicknessMm: 3, image: "vinyl" },
  { id: "v2", title: "Сосна Скандинавская", type: "Виниловый пол", brand: "Quick-Step", price: 2390, inStock: false, wearClass: "33", waterproof: true, thicknessMm: 4, image: "vinyl" },
  { id: "q1", title: "Дуб Медовый", type: "Кварц-винил", brand: "Alpine Floor", price: 2490, inStock: true, wearClass: "43", waterproof: true, thicknessMm: 4, image: "quartz" },
  { id: "q2", title: "Бетон Светлый", type: "Кварц-винил", brand: "Alpine Floor", price: 2790, inStock: true, wearClass: "43", waterproof: true, thicknessMm: 6, image: "quartz" },
  { id: "e1", title: "Дуб Рустик", type: "Инженерная доска", brand: "Barlinek", price: 5490, inStock: true, wearClass: "33", waterproof: false, thicknessMm: 15, image: "engineered" },
  { id: "e2", title: "Дуб Копчёный", type: "Инженерная доска", brand: "Kronospan", price: 6290, inStock: false, wearClass: "33", waterproof: false, thicknessMm: 20, image: "engineered" },
  { id: "c1", title: "Натуральная пробка", type: "Пробковое покрытие", brand: "Wicanders", price: 3190, inStock: true, wearClass: "31", waterproof: false, thicknessMm: 10.5, image: "cork" },
  { id: "c2", title: "Пробка Аква", type: "Пробковое покрытие", brand: "Wicanders", price: 3690, inStock: false, wearClass: "32", waterproof: true, thicknessMm: 6, image: "cork" },
];

export type CatalogFilters = {
  types: string[]; brands: string[]; wearClasses: string[];
  waterproof: "all" | "yes" | "no"; stock: "all" | "yes" | "no";
  thicknesses: number[]; minPrice: number | null; maxPrice: number | null;
};

export const emptyFilters: CatalogFilters = { types: [], brands: [], wearClasses: [], waterproof: "all", stock: "all", thicknesses: [], minPrice: null, maxPrice: null };

export function formatThickness(mm: number, unit: "mm" | "in") {
  return unit === "mm" ? `${mm} мм` : `${(mm / 25.4).toFixed(2)}″`;
}

export function filterProducts(list: CatalogProduct[], f: CatalogFilters) {
  return list.filter(p =>
    (!f.types.length || f.types.includes(p.type)) &&
    (!f.brands.length || f.brands.includes(p.brand)) &&
    (!f.wearClasses.length || f.wearClasses.includes(p.wearClass)) &&
    (!f.thicknesses.length || f.thicknesses.includes(p.thicknessMm)) &&
    (f.waterproof === "all" || p.waterproof === (f.waterproof === "yes")) &&
    (f.stock === "all" || p.inStock === (f.stock === "yes")) &&
    (f.minPrice === null || p.price >= f.minPrice) &&
    (f.maxPrice === null || p.price <= f.maxPrice));
}
