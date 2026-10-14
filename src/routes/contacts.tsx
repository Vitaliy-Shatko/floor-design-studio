import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Layers3, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contacts")({
  head: () => ({ meta: [
    { title: "Контакты — ПОЛЬ" },
    { name: "description", content: "Контакты магазина напольных покрытий ПОЛЬ: телефон, адрес шоурума на карте, соцсети и данные об организации." },
    { property: "og:title", content: "Контакты — ПОЛЬ" },
    { property: "og:description", content: "Телефон, адрес шоурума, соцсети и реквизиты магазина ПОЛЬ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <div className="catalog-page">
      <header className="site-header"><div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="ПОЛЬ — на главную"><Layers3 className="brand-mark" strokeWidth={1.7} /><div><div className="brand-name">ПОЛЬ<span className="text-primary">.</span></div><div className="brand-subtitle">напольные покрытия</div></div></Link>
        <div className="header-right"><nav className="desktop-nav"><Link to="/">Главная</Link><Link to="/catalog">Каталог</Link><Link to="/faq">Вопросы</Link><Link to="/about">О компании</Link><Link to="/contacts" className="text-primary">Контакты</Link></nav>
          <Button asChild variant="cta" className="header-cta"><Link to="/" hash="request">Оставить заявку</Link></Button></div>
      </div></header>

      <main className="site-container catalog-main">
        <div className="eyebrow">Контакты</div>
        <h1 className="page-title">Как нас найти</h1>
        <p className="page-lead">Приходите в шоурум посмотреть образцы вживую или свяжитесь с нами удобным способом.</p>

        <div className="contacts-layout">
          <div className="contacts-info">
            <div className="contact-card">
              <Phone className="contact-icon" />
              <div><h2>Телефон</h2><p>Номер магазина будет добавлен здесь.<br />Позвоните нам — поможем с выбором покрытия.</p></div>
            </div>
            <div className="contact-card">
              <MapPin className="contact-icon" />
              <div><h2>Адрес шоурума</h2><p>Точный адрес магазина будет добавлен здесь.<br />На карте показано примерное расположение.</p></div>
            </div>
            <div className="contact-card">
              <Clock className="contact-icon" />
              <div><h2>Часы работы</h2><p>Режим работы будет добавлен здесь.<br />Уточним удобное время визита по телефону.</p></div>
            </div>
            <div className="contact-card">
              <Send className="contact-icon" />
              <div><h2>Мы в соцсетях</h2><p>Ссылки на VK и Telegram будут добавлены здесь.</p>
                <div className="contact-socials">
                  <span className="social-button contact-social" title="VK — ссылка пока не добавлена"><span className="vk-icon">vk</span></span>
                  <span className="social-button contact-social" title="Telegram — ссылка пока не добавлена"><Send size={16} /></span>
                </div>
              </div>
            </div>
            <div className="contact-card contact-org">
              <h2>Данные об организации</h2>
              <p>Название «ПОЛЬ» — демонстрационное. Реквизиты организации (ИНН, ОГРН, юридический адрес) будут добавлены после того, как вы пришлёте реальные данные.</p>
            </div>
          </div>

          <div className="contacts-map">
            <iframe
              title="Карта расположения шоурума"
              src="https://www.openstreetmap.org/export/embed.html?bbox=30.2800%2C59.9200%2C30.3800%2C59.9600&layer=mapnik&marker=59.9400%2C30.3300"
              loading="lazy"
            />
            <p className="map-note">Карта показывает примерное расположение — точный адрес будет добавлен позже.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
