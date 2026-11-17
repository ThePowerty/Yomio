import { CatalogMediaGrid } from "../../components/CatalogMediaGrid/CatalogMediaGrid";
import "./AnimeCatalogPage.css";

export function AnimeCatalogPage() {
  return (
    <div className="anime-catalog-page">
      <CatalogMediaGrid type="ANIME" />
    </div>
  );
}
