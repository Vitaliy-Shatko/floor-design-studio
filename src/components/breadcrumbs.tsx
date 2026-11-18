import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, type Crumb } from "@/lib/schema";

type BreadcrumbsProps = { items: readonly Crumb[] };

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const crumbs: Crumb[] = [{ name: "Главная", path: "/" }, ...items];
  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <ol className="breadcrumbs-list">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={crumb.name} className="breadcrumbs-item">
                {crumb.path && !isLast ? (
                  <Link to={crumb.path} className="breadcrumbs-link">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="breadcrumbs-current" aria-current="page">
                    {crumb.name}
                  </span>
                )}
                {!isLast && (
                  <ChevronRight className="breadcrumbs-sep" size={12} aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
