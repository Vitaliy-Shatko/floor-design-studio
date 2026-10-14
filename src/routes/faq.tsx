import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [
    { title: "Вопросы и ответы — ПОЛЬ" },
    { name: "description", content: "Ответы на частые вопросы о напольных покрытиях: выбор, укладка, уход, доставка и гарантия." },
    { property: "og:title", content: "Вопросы и ответы — ПОЛЬ" },
    { property: "og:description", content: "Отвечаем на популярные вопросы о напольных покрытиях." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FaqPage,
});

const faqs = [
  { q: "Какое покрытие выбрать для кухни и прихожей?", a: "Для помещений с высокой проходимостью и влажностью лучше всего подходят кварц-винил и влагостойкий ламинат 33–34 класса. Они не боятся воды, легко моются и долго сохраняют вид." },
  { q: "Можно ли укладывать покрытие на тёплый пол?", a: "Да, но не любое. Кварц-винил, инженерная доска и специальные коллекции ламината совместимы с системами тёплого пола. Мы поможем подобрать подходящий вариант и подскажем ограничения по температуре." },
  { q: "Вы делаете укладку или только продаёте материалы?", a: "Мы работаем «под ключ»: помогаем с выбором, привозим материал и выполняем укладку с подготовкой основания. Так вы получаете готовый пол без поиска отдельных мастеров." },
  { q: "Сколько времени занимает доставка?", a: "Товары в наличии привозим в течение нескольких дней. Если покрытие заказывается под вас, срок зависит от поставщика — точную дату мы называем до оформления заказа." },
  { q: "Как ухаживать за напольным покрытием?", a: "Большинству покрытий достаточно регулярной влажной уборки без агрессивных средств. Для паркета и инженерной доски есть специальные средства — расскажем о них при покупке и дадим памятку по уходу." },
  { q: "Есть ли гарантия на покрытия и укладку?", a: "Да. На все покрытия действует гарантия производителя, а на работы по укладке мы даём собственную гарантию. Условия зависят от конкретного материала — уточним при подборе." },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="catalog-page">
      <header className="site-header"><div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="ПОЛЬ — на главную"><Layers3 className="brand-mark" strokeWidth={1.7} /><div><div className="brand-name">ПОЛЬ<span className="text-primary">.</span></div><div className="brand-subtitle">напольные покрытия</div></div></Link>
        <div className="header-right"><nav className="desktop-nav"><Link to="/">Главная</Link><Link to="/catalog">Каталог</Link><Link to="/faq" className="text-primary">Вопросы</Link><Link to="/about">О компании</Link><Link to="/contacts">Контакты</Link></nav>
          <Button asChild variant="cta" className="header-cta"><Link to="/" hash="request">Оставить заявку</Link></Button></div>
      </div></header>

      <main className="site-container catalog-main faq-main">
        <div className="eyebrow">Вопросы и ответы</div>
        <h1 className="page-title">Часто задаваемые вопросы</h1>
        <p className="page-lead">Собрали ответы на вопросы, которые нам задают чаще всего. Не нашли свой — оставьте заявку, и мы всё расскажем.</p>

        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq-item${isOpen ? " is-open" : ""}`}>
                <button type="button" className="faq-question" aria-expanded={isOpen} aria-controls={`faq-answer-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                  <span>{item.q}</span>
                  <ChevronDown className="faq-chevron" size={18} />
                </button>
                {isOpen && <p id={`faq-answer-${i}`} className="faq-answer">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
