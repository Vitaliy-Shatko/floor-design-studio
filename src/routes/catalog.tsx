import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Layers3, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogProducts, emptyFilters, filterProducts, floorTypes, formatThickness, type CatalogFilters } from "@/lib/catalog";
import laminate from "@/assets/material-0.jpg";
import parquet from "@/assets/material-1.jpg";
import quartz from "@/assets/material-2.jpg";
import engineered from "@/assets/material-3.jpg";
import vinyl from "@/assets/vinyl-floor.jpg";
import cork from "@/assets/cork.jpg";

const images: Record<string, string> = { laminate, parquet, quartz, engineered, vinyl, cork };

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [
    { title: "Каталог напольных покрытий — ПОЛЬ" },
    { name: "description", content: "Все товары ПОЛЬ: ламинат, паркетная доска, винил, кварц-винил, инженерная доска и пробка с фильтрами по цене и характеристикам." },
    { property: "og:title", content: "Каталог напольных покрытий — ПОЛЬ" },
    { property: "og:description", content: "Подберите покрытие по типу, бренду, классу износостойкости и цене." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CatalogPage,
});

const uniq = <T,>(a: T[]) => [...new Set(a)].sort();
const brands = uniq(catalogProducts.map(p => p.brand));
const wearClasses = uniq(catalogProducts.map(p => p.wearClass));
const thicknesses = [...new Set(catalogProducts.map(p => p.thicknessMm))].sort((a, b) => a - b);

function toggle<T>(list: T[], v: T) { return list.includes(v) ? list.filter(x => x !== v) : [...list, v]; }

function CatalogPage() {
  const [f, setF] = useState<CatalogFilters>(emptyFilters);
  const [unit, setUnit] = useState<"mm" | "in">("mm");
  const [open, setOpen] = useState(false);
  const result = useMemo(() => filterProducts(catalogProducts, f), [f]);
  const set = (patch: Partial<CatalogFilters>) => setF(prev => ({ ...prev, ...patch }));
  const num = (v: string) => (v === "" ? null : Number(v));

  const checks = (label: string, items: (string | number)[], selected: (string | number)[], onToggle: (v: never) => void, fmt = (v: string | number) => String(v)) => (
    <fieldset className="filter-group"><legend>{label}</legend>{items.map(v => (
      <label key={v} className="filter-check"><input type="checkbox" checked={selected.includes(v)} onChange={() => onToggle(v as never)} />{fmt(v)}</label>
    ))}</fieldset>
  );
  const radios = (label: string, name: "waterproof" | "stock", yes: string, no: string) => (
    <fieldset className="filter-group"><legend>{label}</legend>{([["all", "Все"], ["yes", yes], ["no", no]] as const).map(([v, t]) => (
      <label key={v} className="filter-check"><input type="radio" name={name} checked={f[name] === v} onChange={() => set({ [name]: v })} />{t}</label>
    ))}</fieldset>
  );

  return (
    <div className="catalog-page">
      <header className="site-header"><div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="ПОЛЬ — на главную"><Layers3 className="brand-mark" strokeWidth={1.7} /><div><div className="brand-name">ПОЛЬ<span className="text-primary">.</span></div><div className="brand-subtitle">напольные покрытия</div></div></Link>
        <div className="header-right"><nav className="desktop-nav"><Link to="/">Главная</Link><Link to="/catalog" className="text-primary">Каталог</Link><Link to="/faq">Вопросы</Link><Link to="/about">О компании</Link><Link to="/contacts">Контакты</Link></nav>
          <Button asChild variant="cta" className="header-cta"><Link to="/" hash="request">Оставить заявку</Link></Button></div>
      </div></header>

      <main className="site-container catalog-main">
        <div className="eyebrow">Каталог</div>
        <div className="catalog-top"><h1>Все напольные покрытия</h1>
          <Button variant="outline" className="filters-toggle" onClick={() => setOpen(!open)}>{open ? <X /> : <SlidersHorizontal />} Фильтры</Button></div>

        <div className="catalog-layout">
          <aside className={`catalog-filters ${open ? "is-open" : ""}`} aria-label="Фильтры">
            {checks("Тип покрытия", [...floorTypes], f.types, v => set({ types: toggle(f.types, v) }))}
            {checks("Бренд", brands, f.brands, v => set({ brands: toggle(f.brands, v) }))}
            {checks("Класс износостойкости", wearClasses, f.wearClasses, v => set({ wearClasses: toggle(f.wearClasses, v) }))}
            {radios("Влагостойкость", "waterproof", "Влагостойкие", "Обычные")}
            <fieldset className="filter-group"><legend className="filter-legend-row">Толщина
              <span className="unit-switch">{(["mm", "in"] as const).map(u => <button key={u} type="button" className={unit === u ? "is-active" : ""} onClick={() => setUnit(u)}>{u === "mm" ? "мм" : "дюйм"}</button>)}</span></legend>
              {thicknesses.map(t => <label key={t} className="filter-check"><input type="checkbox" checked={f.thicknesses.includes(t)} onChange={() => set({ thicknesses: toggle(f.thicknesses, t) })} />{formatThickness(t, unit)}</label>)}
            </fieldset>
            <fieldset className="filter-group"><legend>Цена, ₽/м²</legend><div className="price-row">
              <Input className="lead-input" type="number" inputMode="numeric" placeholder="от" value={f.minPrice ?? ""} onChange={e => set({ minPrice: num(e.target.value) })} />
              <Input className="lead-input" type="number" inputMode="numeric" placeholder="до" value={f.maxPrice ?? ""} onChange={e => set({ maxPrice: num(e.target.value) })} />
            </div></fieldset>
            {radios("Наличие", "stock", "Да", "Нет")}
            <Button variant="outline" className="w-full" onClick={() => setF(emptyFilters)}>Сбросить фильтры</Button>
          </aside>

          <section>
            <p className="catalog-count">Найдено товаров: {result.length}</p>
            {result.length === 0 ? <p className="catalog-empty">По выбранным фильтрам ничего не найдено. Попробуйте изменить условия.</p> :
            <div className="catalog-grid">{result.map(p => (
              <article key={p.id} className="product catalog-card">
                <img className="product-image" src={images[p.image]} alt={`${p.type} ${p.title}`} width={1024} height={768} loading="lazy" />
                <div className="catalog-card-body">
                  <span className="catalog-type">{p.type}</span>
                  <h3>{p.title}</h3>
                  <p>{p.brand} · класс {p.wearClass} · {formatThickness(p.thicknessMm, unit)}{p.waterproof ? " · влагостойкий" : ""}</p>
                  <div className="catalog-card-bottom"><strong>{p.price.toLocaleString("ru-RU")} ₽/м²</strong>
                    <span className={p.inStock ? "stock-yes" : "stock-no"}>{p.inStock ? "В наличии" : "Нет в наличии"}</span></div>
                </div>
              </article>))}</div>}
          </section>
        </div>
      </main>
    </div>
  );
}
