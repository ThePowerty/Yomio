import { Activity, Check, Inbox, Pencil, RefreshCw, Search, ShieldCheck, UserCog, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notice } from "../../components/Notice/Notice";
import { StatCard } from "../../components/StatCard/StatCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import { AdminUserActionDialog } from "./AdminUserActionDialog";
import "./AdminPage.css";

const EMPTY_OVERVIEW = { totalUsers: 0, regularUsers: 0, adminUsers: 0, totalMessages: 0, unresolvedMessages: 0 };
const EMPTY_USERS = { items: [], page: 0, size: 10, totalItems: 0, totalPages: 0 };

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuth();
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [requestedPage, setRequestedPage] = useState(0);
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [userPage, setUserPage] = useState(EMPTY_USERS);
  const [messages, setMessages] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [mutationStatus, setMutationStatus] = useState("");
  const [userAction, setUserAction] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const searchRef = useRef(null);
  const locale = i18n.resolvedLanguage?.startsWith("en") ? "en-US" : "es-ES";

  useEffect(() => {
    let stale = false;
    setDashboardLoading(true);
    setDashboardError("");
    Promise.all([
      apiRequest("/api/admin/overview", {}, token),
      apiRequest("/api/contact-messages", {}, token)
    ]).then(([nextOverview, nextMessages]) => {
      if (stale) return;
      setOverview(nextOverview);
      setMessages(nextMessages);
    }).catch((requestError) => {
      if (!stale) setDashboardError(requestError.message);
    }).finally(() => {
      if (!stale) setDashboardLoading(false);
    });
    return () => { stale = true; };
  }, [refreshKey, token]);

  useEffect(() => {
    let stale = false;
    setUsersLoading(true);
    setUsersError("");
    const params = new URLSearchParams({ page: String(requestedPage), size: "10" });
    if (committedQuery) params.set("query", committedQuery);
    apiRequest(`/api/admin/users?${params.toString()}`, {}, token)
      .then((data) => {
        if (stale) return;
        setUserPage(data);
        if (requestedPage > 0 && data.totalPages > 0 && requestedPage >= data.totalPages) {
          setRequestedPage(data.totalPages - 1);
        }
      })
      .catch((requestError) => { if (!stale) setUsersError(requestError.message); })
      .finally(() => { if (!stale) setUsersLoading(false); });
    return () => { stale = true; };
  }, [committedQuery, refreshKey, requestedPage, token]);

  function updateUserSearch(nextQuery, nextPage) {
    setCommittedQuery(nextQuery);
    setRequestedPage(nextPage);
  }

  function submitSearch(event) {
    event.preventDefault();
    updateUserSearch(query.trim(), 0);
  }

  function clearSearch() {
    setQuery("");
    updateUserSearch("", 0);
    searchRef.current?.focus();
  }

  async function resolveMessage(id) {
    setResolvingId(id);
    try {
      const updated = await apiRequest(`/api/contact-messages/${id}/resolve`, { method: "PATCH" }, token);
      setMessages((current) => current.map((item) => item.id === id ? updated : item));
      setOverview((current) => ({ ...current, unresolvedMessages: Math.max(0, current.unresolvedMessages - 1) }));
      setMutationError("");
    } catch (requestError) {
      setMutationError(requestError.message);
    } finally {
      setResolvingId(null);
    }
  }

  function roleUpdated(updated, previousRole) {
    setUserPage((current) => ({ ...current, items: current.items.map((item) => item.id === updated.id ? updated : item) }));
    if (updated.role !== previousRole) {
      const promoted = updated.role === "ADMIN";
      setOverview((current) => ({
        ...current,
        adminUsers: current.adminUsers + (promoted ? 1 : -1),
        regularUsers: current.regularUsers + (promoted ? -1 : 1)
      }));
    }
    setMutationStatus(t("admin.roleUpdated", { username: updated.username }));
    setMutationError("");
  }

  const firstUser = userPage.totalItems === 0 ? 0 : userPage.page * userPage.size + 1;
  const lastUser = Math.min((userPage.page + 1) * userPage.size, userPage.totalItems);

  return (
    <div className="page-stack admin-page">
      <section className="panel admin-command-bar">
        <div><span className="eyebrow">{t("admin.eyebrow")}</span><h2>{t("admin.commandTitle")}</h2><p>{t("admin.commandDescription")}</p></div>
        <button type="button" className="ghost" onClick={() => setRefreshKey((value) => value + 1)} disabled={dashboardLoading || usersLoading}><RefreshCw size={17} aria-hidden="true" /> {t("admin.refresh")}</button>
      </section>

      <Notice message={mutationStatus || mutationError || usersError || dashboardError} onClose={() => { setMutationStatus(""); setMutationError(""); setUsersError(""); setDashboardError(""); }} />

      {dashboardLoading ? <LoadingSkeleton variant="stats" count={4} label={t("common.loading")} /> : <section className="stats-grid admin-stats" aria-label={t("admin.summaryLabel")}>
        <StatCard icon={Users} label={t("admin.totalUsers")} value={overview.totalUsers} detail={t("admin.registeredAccounts")} />
        <StatCard icon={UserCog} label={t("admin.adminUsers")} value={overview.adminUsers} detail={t("admin.regularUsers", { count: overview.regularUsers })} />
        <StatCard icon={Inbox} label={t("admin.pendingMessages")} value={overview.unresolvedMessages} detail={t("admin.totalMessages", { count: overview.totalMessages })} />
        <StatCard icon={ShieldCheck} label={t("admin.accessStatus")} value={t("admin.protected")} detail={t("admin.adminOnly")} />
      </section>}

      <div className="admin-dashboard-grid">
        <section className="panel admin-users-panel" aria-labelledby="admin-users-title">
          <div className="panel-header admin-section-heading"><div><span className="eyebrow">{t("admin.directory")}</span><h2 id="admin-users-title">{t("admin.registeredUsers")}</h2></div><span className="pill">{t("admin.userCount", { count: userPage.totalItems })}</span></div>
          <form className="admin-user-search" noValidate onSubmit={submitSearch} role="search">
            <label htmlFor="admin-user-query">{t("admin.searchUsers")}</label>
            <div className="admin-search-control"><Search size={17} aria-hidden="true" /><input id="admin-user-query" ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("admin.searchPlaceholder")} />{query && <button type="button" onClick={clearSearch} aria-label={t("admin.clearSearch")}><X size={16} /></button>}</div>
            <button type="submit" className="primary" disabled={usersLoading}>{t("common.search")}</button>
          </form>
          <div className="admin-table-frame" aria-busy={usersLoading}>
            {usersLoading ? <LoadingSkeleton variant="table" label={t("admin.loadingUsers")} /> : userPage.items.length === 0 ? <div className="admin-empty"><Users size={28} /><strong>{committedQuery ? t("admin.noUserResults") : t("admin.noUsers")}</strong>{committedQuery && <button type="button" className="ghost" onClick={clearSearch}>{t("admin.clearSearch")}</button>}</div> : <div className="admin-table-scroll"><table><caption className="sr-only">{t("admin.registeredUsers")}</caption><thead><tr><th scope="col">{t("admin.user")}</th><th scope="col">{t("admin.email")}</th><th scope="col">{t("admin.role")}</th><th scope="col">{t("admin.policies")}</th><th scope="col">{t("admin.actions")}</th></tr></thead><tbody>{userPage.items.map((item) => <tr key={item.id ?? item.username}><td><strong>{item.username}</strong></td><td>{item.email}</td><td><span className={`admin-role role-${item.role.toLowerCase()}`}>{t(`admin.roles.${item.role}`)}</span></td><td>{item.policiesAccepted ? t("admin.accepted") : t("admin.pending")}</td><td><div className="admin-row-actions"><button type="button" onClick={() => setUserAction({ mode: "progress", user: item })}><Activity size={15} aria-hidden="true" />{t("admin.viewProgress")}</button><button type="button" onClick={() => setUserAction({ mode: "role", user: item })} disabled={item.username === user?.username} title={item.username === user?.username ? t("admin.cannotEditOwnRole") : undefined}><Pencil size={15} aria-hidden="true" />{t("admin.editRole")}</button></div></td></tr>)}</tbody></table></div>}
          </div>
          <nav className="admin-pagination" aria-label={t("admin.userPagination")}><span>{t("admin.userRange", { first: firstUser, last: lastUser, total: userPage.totalItems })}</span><div><button type="button" className="ghost" disabled={usersLoading || userPage.page <= 0} onClick={() => setRequestedPage(userPage.page - 1)}>{t("pagination.previous")}</button><span aria-current="page">{t("admin.pageOf", { page: userPage.totalPages ? userPage.page + 1 : 0, total: userPage.totalPages })}</span><button type="button" className="ghost" disabled={usersLoading || userPage.page + 1 >= userPage.totalPages} onClick={() => setRequestedPage(userPage.page + 1)}>{t("pagination.next")}</button></div></nav>
        </section>

        <section className="panel admin-inbox" aria-labelledby="admin-inbox-title" aria-busy={dashboardLoading}>
          <div className="panel-header admin-section-heading"><div><span className="eyebrow">{t("admin.inbox")}</span><h2 id="admin-inbox-title">{t("admin.contactMessages")}</h2></div><span className="pill"><Inbox size={14}/>{overview.unresolvedMessages}</span></div>
          {dashboardLoading ? <LoadingSkeleton variant="list" count={4} label={t("admin.loadingMessages")} /> : messages.length === 0 ? <div className="admin-empty"><Inbox size={28}/><strong>{t("admin.noMessages")}</strong></div> : <div className="admin-message-list">{messages.map((item) => <article key={item.id} className={item.resolvedAt ? "resolved" : ""}><div><span className="pill">{t(`contact.categories.${item.category}`)}</span><time dateTime={item.createdAt}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time></div><h3>{item.subject}</h3><p>{item.message}</p><small>{t("admin.sentBy", { username: item.username })}</small>{!item.resolvedAt && <button className="ghost" disabled={resolvingId === item.id} aria-busy={resolvingId === item.id} onClick={() => resolveMessage(item.id)}><Check size={15}/>{resolvingId === item.id ? t("admin.resolving") : t("admin.markResolved")}</button>}</article>)}</div>}
        </section>
      </div>
      <AdminUserActionDialog action={userAction} token={token} onClose={() => setUserAction(null)} onRoleUpdated={roleUpdated} />
    </div>
  );
}
