import { BookOpen, Shield, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../../components/StatCard/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useTracker } from "../../context/TrackerContext";
import "./AdminPage.css";

export function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stats } = useTracker();

  return (
    <div className="page-stack admin-page">
      <section className="stats-grid">
        <StatCard icon={Shield} label={t("admin.currentRole")} value={user.role} detail={t("admin.sessionPermissions")} />
        <StatCard icon={Users} label={t("admin.users")} value="1" detail={t("admin.readyPanel")} />
        <StatCard icon={BookOpen} label={t("admin.entries")} value={stats.anime + stats.manga} detail={t("admin.totalPersonal")} />
      </section>
      <div className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">{t("admin.eyebrow")}</span>
          </div>
        </div>
        <p className="muted">{t("admin.restricted")}</p>
      </div>
    </div>
  );
}
