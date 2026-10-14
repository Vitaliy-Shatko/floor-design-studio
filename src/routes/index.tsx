import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, ArrowRight, ArrowLeft, Layers3, ShieldCheck, Truck, Ruler, Check, Menu, X, Star, Send, Leaf, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { headerShouldHide, isValidPhone } from "@/lib/landing-rules";
import living from "@/assets/flooring-living.jpg";
import showroom from "@/assets/flooring-showroom.jpg";
import laminate from "@/assets/material-0.jpg";
import parquet from "@/assets/material-1.jpg";
import vinyl from "@/assets/material-2.jpg";
import engineered from "@/assets/material-3.jpg";
import carpet from "@/assets/material-4.jpg";
import installation from "@/assets/material-5.jpg";

import reviewAnna from "@/assets/review-0.jpg";
import reviewMikhail from "@/assets/review-1.jpg";
import reviewElena from "@/assets/review-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ПОЛЬ — напольные покрытия для вашего дома" },
    { name: "description", content: "Ламинат, паркет, кварцвинил и ковролин. Подберём напольное покрытие под ваш интерьер и поможем с укладкой." },
    { property: "og:title", content: "ПОЛЬ — напольные покрытия для вашего дома" },
    { property: "og:description", content: "Красивый пол — начало уютного дома. Найдите своё покрытие в ПОЛЬ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const navigation = [{ href: "#catalog", label: "Каталог" }, { href: "#about", label: "О компании" }, { href: "#reviews", label: "Отзывы" }, { href: "#contacts", label: "Контакты" }];
const benefits = [
  { icon: Layers3, title: "На любой вкус", text: "От натурального дерева до практичного кварцвинила" },
  { icon: ShieldCheck, title: "Уверенность в качестве", text: "Покрытия от проверенных производителей" },
  { icon: Ruler, title: "Поможем с выбором", text: "Подберём пол под ваш интерьер, задачи и бюджет" },
  { icon: Truck, title: "Всё в одних руках", text: "От подбора покрытия до доставки и укладки" },
];
const products = [
  { title: "Ламинат", text: "Практичный. Красивый. Ваш.", image: laminate },
  { title: "Паркет", text: "Природное тепло настоящего дерева", image: parquet },
  { title: "Кварцвинил", text: "Для жизни без лишних забот", image: vinyl },
  { title: "Инженерная доска", text: "Эстетика дерева и стабильность", image: engineered },
  { title: "Ковролин", text: "Мягкость в каждом шаге", image: carpet },
  { title: "Укладка и аксессуары", text: "Последний штрих к идеальному полу", image: installation },
];
const reviews = [
  { name: "Анна М.", photo: reviewAnna, type: "Выбрала кварцвинил", quote: "«Долго выбирали покрытие для новой квартиры. Здесь помогли разобраться во всех нюансах и нашли именно тот оттенок, который мы искали. Пол получился невероятно красивым. Спасибо за внимание к деталям!»" },
  { name: "Михаил К.", photo: reviewMikhail, type: "Выбрал инженерную доску", quote: "«Хотелось натуральное дерево, но было много вопросов по уходу и укладке. Всё спокойно объяснили, показали образцы. Теперь дома именно тот пол, о котором мечтали.»" },
  { name: "Елена С.", photo: reviewElena, type: "Выбрала ламинат", quote: "«Очень понравилось, что не торопили с выбором. Сравнили несколько вариантов, подобрали плинтус в тон. Весь интерьер сразу стал выглядеть законченным и уютным.»" },
];

function Brand() {
  return <a className="brand" href="#top" aria-label="ПОЛЬ — на главную"><Layers3 className="brand-mark" strokeWidth={1.7} /><div><div className="brand-name">ПОЛЬ<span className="text-primary">.</span></div><div className="brand-subtitle">напольные покрытия</div></div></a>;
}

function Index() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selection, setSelection] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string | undefined; phone?: string | undefined }>({});
  const [notice, setNotice] = useState("");
  useEffect(() => {
    let previous = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      if (Math.abs(current - previous) < 5) return;
      setHidden(headerShouldHide(previous, current));
      previous = current;
      setMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const requestProduct = (title: string) => {
    setSelection(title);
    setNotice("");
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = { name: name.trim().length < 2 ? "Укажите ваше имя" : undefined, phone: !isValidPhone(phone) ? "Укажите полный номер телефона" : undefined };
    setErrors(next);
    setNotice(next.name || next.phone ? "" : "Отправка пока не подключена. Заявка не отправлена — для связи необходимо добавить контакты магазина.");
  };
  const review = reviews[reviewIndex];
  if (!review) return null;
  return (
    <>
      <header className={`site-header${hidden ? " is-hidden" : ""}`}>
        <div className="site-container header-inner"><Brand /><div className="header-right"><nav className="desktop-nav" aria-label="Основное меню">{navigation.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav><Button asChild variant="cta" className="header-cta"><a href="#request">Оставить заявку <ArrowUpRight /></a></Button><Button variant="ghost" size="icon" className="mobile-toggle" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div></div>
        {menuOpen && <nav className="mobile-menu" aria-label="Мобильное меню">{navigation.map(item => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}</nav>}
      </header>

      <main id="top">
        <section className="hero site-container">
          <div className="hero-grid">
            <div><div className="eyebrow">Основа вашего уюта</div><h1>Красивый пол —<br />начало <span>уютного<br />дома.</span></h1><p className="hero-description">Напольные покрытия, которые хочется видеть дома. Поможем найти ваше — по стилю, ощущениям и бюджету.</p><div className="hero-actions"><Button asChild variant="cta" size="cta" className="hero-cta"><a href="#catalog">Подобрать покрытие <ArrowUpRight /></a></Button><a className="hero-secondary" href="#request">Получить консультацию <ArrowRight size={16} /></a></div><div className="hero-note"><Check size={14} /> От первого образца до последней уложенной доски</div></div>
            <div className="hero-visual"><img className="hero-photo" src={living} alt="Светлая гостиная с натуральным дубовым паркетом и синим креслом" width={1536} height={1024} fetchPriority="high" /><div className="photo-label"><Leaf size={24} strokeWidth={1.5} /><div><strong>Красота, которую чувствуешь</strong><span>Натуральные текстуры. Настоящий уют.</span></div></div><div className="photo-index" aria-hidden="true"><i /><i /><i /></div></div>
          </div>
        </section>

        <section className="benefits site-container" aria-label="Наши преимущества"><div className="benefit-grid">{benefits.map(({ icon: Icon, title, text }) => <article className="benefit" key={title}><Icon className="benefit-icon" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>

        <section id="about" className="section section-soft"><div className="site-container about-grid"><img className="about-photo" src={showroom} alt="Образцы деревянных и каменных покрытий в светлом шоуруме" width={1536} height={1024} loading="lazy" /><div className="about-text"><div className="eyebrow">Знакомьтесь, ПОЛЬ</div><h2>Знаем о полах всё.<br />И немного больше.</h2><p>Мы верим, что уют начинается с деталей. С оттенка дерева, с приятной фактуры, с ощущения тёплого пола под ногами.</p><p>Поэтому для нас важно не просто предложить покрытие, а помочь найти то самое. Для вашей жизни, вашего пространства и вашего дома.</p><a className="about-link" href="#request">Давайте познакомимся <ArrowUpRight size={16} /></a></div></div></section>

        <section id="catalog" className="section site-container"><div className="section-heading"><div><div className="eyebrow">Найдите своё покрытие</div><h2>Для каждого дома. Для вас.</h2></div><p>Разные материалы. Тысячи возможностей.<br />Одно неизменно — внимание к качеству.</p></div><div className="product-grid">{products.map(product => <article className="product" key={product.title}><img className="product-image" src={product.image} alt={product.title} width={510} height={510} loading="lazy" /><div className="product-info"><div><h3>{product.title}</h3><p>{product.text}</p></div><Button variant="round" size="icon" className="product-arrow" aria-label={`Подобрать: ${product.title}`} title={`Подобрать: ${product.title}`} onClick={() => requestProduct(product.title)}><ArrowUpRight /></Button></div></article>)}</div></section>

        <section id="reviews" className="section section-soft review-section"><div className="site-container"><div className="section-heading"><div><div className="eyebrow">Тёплые слова</div><h2>Дома хорошо. С нами — тоже.</h2></div><div className="review-controls"><Button variant="round" size="icon" aria-label="Предыдущий отзыв" onClick={() => setReviewIndex((reviewIndex + 2) % 3)}><ArrowLeft /></Button><Button variant="round" size="icon" aria-label="Следующий отзыв" onClick={() => setReviewIndex((reviewIndex + 1) % 3)}><ArrowRight /></Button></div></div><div className="review-layout"><div className="rating-summary"><div className="rating-number">5,0</div><div className="stars" aria-label="5 из 5">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}</div><div className="rating-label">Демонстрационные отзывы</div></div><div aria-live="polite"><blockquote className="review-quote">{review.quote}</blockquote><div className="review-bottom"><div className="review-author"><img className="avatar" src={review.photo} alt={review.name} width={43} height={43} loading="lazy" /><div><strong>{review.name}</strong><span>{review.type}</span></div></div><span className="review-counter">0{reviewIndex + 1} / 03</span></div></div></div></div></section>

        <section id="request" className="request-section"><div className="site-container request-grid"><div><div className="eyebrow">Начнём с разговора</div><h2>Ваш идеальный пол<br />ближе, чем кажется.</h2><p>{selection ? `Вас интересует: ${selection}. Оставьте контакты для консультации.` : "Оставьте заявку — обсудим ваши идеи и поможем подобрать покрытие для вашего дома."}</p></div><form noValidate onSubmit={submit}><div className="form-row"><div><label className="form-label" htmlFor="lead-name">Ваше имя</label><Input id="lead-name" name="name" autoComplete="given-name" className="lead-input" placeholder="Как к вам обращаться?" value={name} onChange={e => setName(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} required />{errors.name && <div id="name-error" className="field-error">{errors.name}</div>}</div><div><label className="form-label" htmlFor="lead-phone">Телефон</label><Input id="lead-phone" name="phone" type="tel" autoComplete="tel" className="lead-input" placeholder="+7 (___) ___-__-__" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : undefined} required />{errors.phone && <div id="phone-error" className="field-error">{errors.phone}</div>}</div></div><Button type="submit" variant="cta" size="cta" className="form-submit">Оставить заявку <ArrowUpRight /></Button><div className="form-fineprint">Демонстрационная форма. Отправка заявок будет доступна после подключения контактов магазина.</div>{notice && <div className="form-message" role="status">{notice}</div>}</form></div></section>
      </main>

      <footer id="contacts" className="site-footer"><div className="site-container"><div className="footer-grid"><div className="footer-brand"><Brand /><p className="footer-description">Напольные покрытия,<br />с которых начинается ваш дом.</p></div><div><h3 className="footer-title">Навигация</h3><nav className="footer-links" aria-label="Меню в подвале">{navigation.map(item => <a href={item.href} key={item.href}>{item.label}</a>)}</nav></div><div><h3 className="footer-title">Будем на связи</h3><div className="footer-contacts">Телефон и адрес магазина<br />будут добавлены здесь.</div><a href="#request" className="about-link">Оставить заявку <ChevronRight size={14} /></a></div><div><h3 className="footer-title">Мы в соцсетях</h3><div className="footer-socials"><Button variant="ghost" size="icon" className="social-button" title="VK — ссылка пока не добавлена" aria-label="VK — ссылка пока не добавлена" onClick={() => { setNotice("Ссылка на VK магазина пока не добавлена."); document.getElementById("request")?.scrollIntoView({ behavior: "smooth" }); }}><span className="vk-icon">vk</span></Button><Button variant="ghost" size="icon" className="social-button" title="Telegram — ссылка пока не добавлена" aria-label="Telegram — ссылка пока не добавлена" onClick={() => { setNotice("Ссылка на Telegram магазина пока не добавлена."); document.getElementById("request")?.scrollIntoView({ behavior: "smooth" }); }}><Send size={16} /></Button></div></div></div><div className="footer-bottom"><span>© 2026 ПОЛЬ. Демонстрационный магазин.</span><span>Название, тексты и отзывы — примеры. Реквизиты организации не указаны.</span></div></div></footer>
    </>
  );
}
