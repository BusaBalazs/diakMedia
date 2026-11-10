import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icons.jsx";
import ContentCard from "../components/ContentCard.jsx";
import { Dot } from "../components/StatusBadge.jsx";
import {
  EmptyState,
  ErrorNotice,
  PageHeader,
  Skeleton,
} from "../components/Parts.jsx";
import { btnPrimary, card, input } from "../components/ui.js";
import { categories } from "../../data/categories.js";
import { FORMAT_LIST } from "../config/formats.js";
import { can } from "../config/roles.js";
import { STATUSES, WORKFLOW_ORDER } from "../config/workflow.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { getRepository } from "../data/repository.js";
import { toDate } from "../lib/date.js";
import { useAsync } from "../lib/useAsync.js";

const BOARD = [
  "submitted",
  "editorial_review",
  "awaiting_teacher",
  "published",
];
const OTHER = ["draft", "changes_requested", "withdrawn"];
const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
const when = (c) => toDate(c.submittedAt || c.createdAt)?.getTime() || 0;

export default function ContentBoard() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get("statusz") || "all";
  const kat = params.get("kat") || "";
  const fmt = params.get("formatum") || "";
  const q = params.get("q") || "";
  const boardStatuses = WORKFLOW_ORDER;
  const statusLabel = (s) => {
    if (user.role === "teacher" && s === "submitted")
      return "Szerkesztői lektorálásra vár";
    if (user.role === "teacher" && s === "awaiting_teacher")
      return "Tanári jóváhagyásra várva";
    return STATUSES[s].label;
  };
  const selectedStatus = status;
  const set = (key, v) => {
    const p = new URLSearchParams(params);
    if (v) p.set(key, v);
    else p.delete(key);
    setParams(p, { replace: true });
  };

  const { data, error, loading, reload } = useAsync(
    async () =>
      (await getRepository()).listContent({
        schoolId: user.schoolId,
        role: user.role,
        uid: user.uid,
      }),
    [user.uid, user.role],
  );

  const head = (
    <PageHeader
      title="Tartalmak"
      description={
        user.role === "author"
          ? "A saját tartalmaid és azok állapota."
          : "Az iskola tartalmai a munkafolyamat lépései szerint."
      }
      actions={
        can(user.role, "content.create") && (
          <Link to="/admin/tartalmak/uj" className={btnPrimary}>
            <Icon name="plus" size={18} /> Új tartalom
          </Link>
        )
      }
    />
  );
  if (loading)
    return (
      <>
        {head}
        <div className="grid gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </>
    );
  if (error)
    return (
      <>
        {head}
        <ErrorNotice error={error} onRetry={reload} />
      </>
    );

  const terms = norm(q).split(/\s+/).filter(Boolean);
  const filtered = data
    .filter(
      (c) =>
        (!kat || c.category === kat) &&
        (!fmt || c.format === fmt) &&
        terms.every((t) => norm(`${c.title} ${c.authorName}`).includes(t)),
    )
    .sort((a, b) => when(b) - when(a));
  const by = (s) =>
    filtered.filter(
      (c) =>
        c.status === s ||
        (user.role === "teacher" &&
          s === "submitted" &&
          c.status === "awaiting_teacher"),
    );
  const counts = Object.fromEntries(WORKFLOW_ORDER.map((s) => [s, by(s).length]));
  const single = selectedStatus !== "all" ? selectedStatus : null;
  const filtersActive = Boolean(kat || fmt || q || single);

  const sel = `${input} h-10`;
  return (
    <>
      {head}
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_13rem]">
        <label className="sr-only" htmlFor="board-q">
          Keresés
        </label>
        <input
          id="board-q"
          type="search"
          lang="hu"
          spellCheck="true"
          className={sel}
          placeholder="Keresés cím vagy szerző szerint"
          value={q}
          onChange={(e) => set("q", e.target.value)}
        />
        <select
          aria-label="Kategória"
          className={sel}
          value={kat}
          onChange={(e) => set("kat", e.target.value)}
        >
          <option value="">Minden kategória</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Formátum"
          className={sel}
          value={fmt}
          onChange={(e) => set("formatum", e.target.value)}
        >
          <option value="">Minden formátum</option>
          {FORMAT_LIST.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Állapot"
          className={sel}
          value={selectedStatus}
          onChange={(e) =>
            set("statusz", e.target.value === "all" ? "" : e.target.value)
          }
        >
          <option value="all">Minden állapot</option>
          {boardStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      {filtersActive && (
        <button
          type="button"
          onClick={() => setParams({}, { replace: true })}
          className="mb-4 text-sm font-medium text-brand hover:underline"
        >
          Szűrők törlése
        </button>
      )}

      {data.length === 0 && (
        <div className={card}>
          <EmptyState
            title="Még nincs tartalom"
            text="Amint valaki létrehoz egy tartalmat, itt jelenik meg."
            action={
              <Link to="/admin/tartalmak/uj" className={`${btnPrimary} mt-2`}>
                Új tartalom
              </Link>
            }
          />
        </div>
      )}

      {data.length > 0 && (
        <>
          {/* Mobile and single-status view: status chips + stacked cards */}
          <div className={single ? "" : "lg:hidden"}>
            {!single && (
              <div
                className="-mx-3 sm:mx-0 mb-3 flex gap-1.5 overflow-x-auto px-3 sm:px-0 pb-1"
                role="group"
                aria-label="Állapot szerint"
              >
                <button
                  type="button"
                  aria-pressed={selectedStatus === "all"}
                  onClick={() => set("statusz", "")}
                  className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium border ${selectedStatus === "all" ? "bg-brand text-white border-brand" : "bg-surface border-line text-gray-700"}`}
                >
                  Mind {filtered.length}
                </button>
                {boardStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={selectedStatus === s}
                    onClick={() => set("statusz", s)}
                    className={`shrink-0 h-8 px-3 rounded-full text-xs font-medium border ${selectedStatus === s ? "bg-brand text-white border-brand" : "bg-surface border-line text-gray-700"}`}
                  >
                    {statusLabel(s)} {counts[s]}
                  </button>
                ))}
              </div>
            )}
            {single && (
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Dot tone={STATUSES[single].tone} />
                {statusLabel(single)}{" "}
                <span className="text-muted font-normal">
                  ({by(single).length})
                </span>
              </p>
            )}
            <ul
              className={`grid gap-2.5 ${single ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}
            >
              {(single ? by(single) : filtered).map((c) => (
                <li key={c.id}>
                  <ContentCard item={c} showStatus={!single} />
                </li>
              ))}
            </ul>
            {(single ? by(single) : filtered).length === 0 && (
              <div className={card}>
                <EmptyState
                  title="Nincs találat"
                  text="Ezzel a szűréssel nincs megjeleníthető tartalom."
                />
              </div>
            )}
          </div>

          {/* Desktop board */}
          {!single && (
            <div className="hidden lg:block">
              <div className={`grid ${user.role === "teacher" ? "grid-cols-5" : "grid-cols-4"} gap-4 items-start`}>
                {BOARD.map((s) => (
                  <section
                    key={s}
                    aria-labelledby={`col-${s}`}
                    className="rounded-xl bg-gray-100/70 p-2.5"
                  >
                    <h2
                      id={`col-${s}`}
                      className="flex items-center gap-2 px-1.5 py-1.5 text-sm font-semibold"
                    >
                      <Dot tone={STATUSES[s].tone} />
                      {statusLabel(s)}
                      <span className="ml-auto text-xs font-medium text-muted tabular-nums">
                        {counts[s]}
                      </span>
                    </h2>
                    <ul className="mt-1 grid gap-2">
                      {by(s)
                        .slice(0, s === "published" ? 8 : 50)
                        .map((c) => (
                          <li key={c.id}>
                            <ContentCard item={c} showStatus={false} />
                          </li>
                        ))}
                      {by(s).length === 0 && (
                        <li className="px-2 py-6 text-center text-xs text-muted">
                          Nincs elem
                        </li>
                      )}
                    </ul>
                    {s === "published" && by(s).length > 8 && (
                      <button
                        type="button"
                        className="mt-2 w-full text-xs font-medium text-brand hover:underline"
                        onClick={() => set("statusz", "published")}
                      >
                        Összes közzétett ({by(s).length})
                      </button>
                    )}
                  </section>
                ))}
              </div>
              <section className="mt-6" aria-labelledby="other-title">
                <h2 id="other-title" className="mb-3 text-sm font-semibold">
                  Piszkozatok, módosításra váróak és visszavontak
                </h2>
                <div className="grid grid-cols-3 gap-4 items-start">
                  {OTHER.map((s) => (
                    <div key={s} className="rounded-xl bg-gray-100/70 p-2.5">
                      <p className="flex items-center gap-2 px-1.5 py-1.5 text-sm font-medium">
                        <Dot tone={STATUSES[s].tone} />
                        {STATUSES[s].label}
                        <span className="ml-auto text-xs text-muted tabular-nums">
                          {counts[s]}
                        </span>
                      </p>
                      <ul className="mt-1 grid gap-2">
                        {by(s).map((c) => (
                          <li key={c.id}>
                            <ContentCard item={c} showStatus={false} />
                          </li>
                        ))}
                        {by(s).length === 0 && (
                          <li className="px-2 py-4 text-center text-xs text-muted">
                            Nincs elem
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
