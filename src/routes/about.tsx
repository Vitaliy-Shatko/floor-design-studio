import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import showroom from "@/assets/flooring-showroom.jpg";
import teamDirector from "@/assets/team-0.jpg";
import teamConsultant from "@/assets/team-1.jpg";
import teamInstaller from "@/assets/team-2.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "О компании — ПОЛЬ" },
    { name: "description", content: "История магазина напольных покрытий ПОЛЬ и команда, которая помогает выбирать и укладывать полы." },
    { property: "og:title", content: "О компании — ПОЛЬ" },
    { property: "og:description", content: "Наша история и команда магазина напольных покрытий ПОЛЬ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AboutPage,
});

const team = [
  { name: "Дмитрий Соколов", role: "Основатель и директор", photo: teamDirector, text: "Отвечает за выбор коллекций и отношения с поставщиками. Знает ассортимент до последней доски." },
  { name: "Анна Ветрова", role: "Консультант по покрытиям", photo: teamConsultant, text: "Помогает подобрать покрытие под интерьер, задачи и бюджет. Покажет образцы и честно расскажет о нюансах." },
  { name: "Игорь Лебедев", role: "Руководитель укладки", photo: teamInstaller, text: "Возглавляет бригаду укладчиков. Следит за подготовкой основания и качеством каждого шва." },
];

const stats = [
  { value: "15", label: "лет на рынке" },
  { value: "10 000+", label: "довольных клиентов" },
  { value: "50+", label: "брендов-партнеров" },
  { value: "500+", label: "видов покрытий" },
];

function AboutPage() {
  return (
    <div className="catalog-page">
      <header className="site-header"><div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="ПОЛЬ — на главную"><Layers3 className="brand-mark" strokeWidth={1.7} /><div><div className="brand-name">ПОЛЬ<span className="text-primary">.</span></div><div className="brand-subtitle">напольные покрытия</div></div></Link>
        <div className="header-right"><nav className="desktop-nav"><Link to="/">Главная</Link><Link to="/catalog">Каталог</Link><Link to="/faq">Вопросы</Link><Link to="/about" className="text-primary">О компании</Link><Link to="/contacts">Контакты</Link></nav>
          <Button asChild variant="cta" className="header-cta"><Link to="/" hash="request">Оставить заявку</Link></Button></div>
      </div></header>

      <main className="site-container catalog-main">
        <div className="eyebrow">О компании</div>
        <h1 className="page-title">Мы — ПОЛЬ. И мы знаем о полах всё.</h1>

        <section className="history-grid">
          <img className="about-photo" src={showroom} alt="Шоурум магазина ПОЛЬ с образцами напольных покрытий" width={1536} height={1024} loading="lazy" />
          <div className="about-text">
            <h2 className="history-title">Наша история</h2>
            <p>Всё началось с маленького шоурума и большой любви к красивым интерьерам. Мы видели, как сложно людям выбирать напольные покрытия: сотни коллекций, непонятные характеристики, страх ошибиться.</p>
            <p>Поэтому мы решили делать всё иначе — не продавать «что есть», а подбирать «что подходит». Сначала слушаем, как вы живёте, а потом предлагаем варианты: от практичного кварц-винила до тёплой инженерной доски.</p>
            <p>Сегодня ПОЛЬ — это шоурум с сотнями образцов, своя служба доставки и бригада укладчиков. Но главное не изменилось: мы по-прежнему начинаем с разговора о вашем доме.</p>
            <p className="history-note">Текст демонстрационный — пришлите настоящую историю компании, и мы заменим его.</p>
          </div>
        </section>

        <section className="stats-band">
          <div className="site-container stats-grid">
            {stats.map(stat => (
              <div key={stat.label} className="stat">
                <strong className="stat-value">{stat.value}</strong>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <div className="section-heading"><div><div className="eyebrow">Наша команда</div><h2>Люди, которые помогут с выбором</h2></div><p>Познакомьтесь с теми, кто встретит вас в шоуруме<br />и доведёт ваш пол до идеала.</p></div>
          <div className="team-grid">
            {team.map(member => (
              <article key={member.name} className="team-card">
                <img className="team-photo" src={member.photo} alt={member.name} width={816} height={816} loading="lazy" />
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.text}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="history-note">Имена и фотографии команды демонстрационные.</p>
        </section>
      </main>
    </div>
  );
}
