import { CatalogMediaGrid } from "../../components/CatalogMediaGrid/CatalogMediaGrid";
import "./MangaCatalogPage.css";

export function MangaCatalogPage() {
  return (
    <div className="manga-catalog-page">
      <CatalogMediaGrid type="MANGA" />
    </div>
  );
}
