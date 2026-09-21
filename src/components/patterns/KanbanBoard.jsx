import { Link } from 'react-router-dom';
import { LEAD_STAGES, STAGE_LABELS } from '../../lib/constants';
import { Avatar } from '../ui/avatar';
import { MoneyText } from './MoneyText';
import { DateText } from './DateText';
import { DropdownMenu, DropdownItem } from '../ui/dropdown-menu';
import { IconMoreHorizontal, IconClock, IconMapPin } from '../ui/icons';
import { EmptyState } from './EmptyState';
import { cn } from '../../lib/cn';

/**
 * 7 columns, each capped server-side. Deliberately no drag-and-drop: a
 * kebab menu's "Move to" list covers the requirement without pulling in a
 * DnD library and its edge cases, at a fraction of the build time.
 */
export function KanbanBoard({ rows, counts, onMoveStage }) {
  const byStage = Object.fromEntries(LEAD_STAGES.map((s) => [s, rows.filter((r) => r.stage === s)]));

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-border bg-surface shadow-xs">
        <EmptyState title="No leads yet" description="Create your first lead to see it appear on the board." />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {LEAD_STAGES.map((stage) => {
        const stageRows = byStage[stage] ?? [];
        const meta = counts.find((c) => c.stage === stage);
        const fg = `var(--color-stage-${stage}-fg)`;

        return (
          <section key={stage} className="flex flex-col w-70 shrink-0">
            {/* Column header, with a colour cap matching the stage. */}
            <header className="sticky top-0 z-10 rounded-t-xl border border-b-0 border-border bg-surface-muted/90 backdrop-blur-sm px-3 pt-2.5 pb-2">
              <span className="block h-0.5 w-8 rounded-full mb-2" style={{ backgroundColor: fg }} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm font-semibold text-fg truncate">{STAGE_LABELS[stage]}</h3>
                  <span className="rounded-full bg-surface px-1.5 text-xs font-semibold text-fg-subtle tabular-nums ring-1 ring-inset ring-border">
                    {meta?.count ?? 0}
                  </span>
                </div>
                {meta?.value > 0 && (
                  <MoneyText value={meta.value} className="text-xs font-medium text-fg-muted" />
                )}
              </div>
            </header>

            <div className="flex flex-col gap-2 rounded-b-xl border border-t-0 border-border bg-surface-sunken/40 p-2 min-h-24">
              {stageRows.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-fg-subtle">No leads in this stage</p>
              )}

              {stageRows.map((lead, i) => {
                const overdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date();
                return (
                  <article
                    key={lead.id}
                    className="group rounded-lg border border-border bg-surface p-3 shadow-xs transition-all duration-150 hover:border-border-strong hover:shadow-md animate-slide-up"
                    style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/leads/${lead.id}`} className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg truncate transition-colors group-hover:text-brand-700">
                          {lead.fullName}
                        </p>
                        <p className="text-xs text-fg-subtle truncate mt-0.5">{lead.phone}</p>
                      </Link>
                      <DropdownMenu
                        align="end"
                        trigger={
                          <button
                            aria-label="Lead actions"
                            className="shrink-0 rounded p-1 -m-1 text-fg-subtle opacity-0 transition-opacity hover:text-fg group-hover:opacity-100 focus:opacity-100"
                          >
                            <IconMoreHorizontal size={16} />
                          </button>
                        }
                      >
                        <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                          Move to
                        </p>
                        {LEAD_STAGES.filter((s) => s !== stage).map((s) => (
                          <DropdownItem key={s} onClick={() => onMoveStage(lead, s)}>
                            {STAGE_LABELS[s]}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </div>

                    {lead.interestedProjectName && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-fg-muted truncate">
                        <IconMapPin size={11} className="shrink-0 opacity-70" />
                        {lead.interestedProjectName}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                      <Avatar name={lead.assignedToName} size="xs" />
                      {lead.nextFollowUpAt ? (
                        <span
                          className={cn(
                            'flex items-center gap-1 text-xs',
                            overdue ? 'font-medium text-danger-600' : 'text-fg-subtle'
                          )}
                        >
                          <IconClock size={11} />
                          <DateText value={lead.nextFollowUpAt} relative overdue={overdue} />
                        </span>
                      ) : (
                        lead.budgetMax && <MoneyText value={lead.budgetMax} className="text-xs text-fg-subtle" />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
