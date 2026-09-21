import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar } from '../../../components/ui/avatar';
import { EmptyState } from '../../../components/patterns/EmptyState';
import { DateText } from '../../../components/patterns/DateText';
import { StageBadge } from '../../../components/patterns/StageBadge';
import { SkeletonText } from '../../../components/ui/skeleton';
import { ACTIVITY_LABELS } from '../../../lib/constants';
import { cn } from '../../../lib/cn';
import {
  IconClipboard,
  IconPhone,
  IconMail,
  IconUsers,
  IconHome,
  IconTrendingUp,
  IconClock,
  IconActivity,
  IconArrowRight,
} from '../../../components/ui/icons';
import { useAddActivity, useLeadActivities } from '../hooks';

/** Each activity type gets its own glyph and tint so the feed scans by shape. */
const TYPES = {
  note: { Icon: IconClipboard, tone: 'bg-neutral-100 text-neutral-600 ring-neutral-500/15' },
  call: { Icon: IconPhone, tone: 'bg-info-50 text-info-600 ring-info-600/15' },
  email: { Icon: IconMail, tone: 'bg-purple-50 text-purple-600 ring-purple-600/15' },
  meeting: { Icon: IconUsers, tone: 'bg-teal-50 text-teal-600 ring-teal-600/15' },
  site_visit: { Icon: IconHome, tone: 'bg-accent-50 text-accent-600 ring-accent-600/15' },
  stage_change: { Icon: IconTrendingUp, tone: 'bg-brand-50 text-brand-600 ring-brand-600/15' },
  assignment: { Icon: IconUsers, tone: 'bg-neutral-100 text-neutral-600 ring-neutral-500/15' },
  follow_up: { Icon: IconClock, tone: 'bg-warning-50 text-warning-600 ring-warning-600/15' },
  booking: { Icon: IconClipboard, tone: 'bg-success-50 text-success-600 ring-success-600/15' },
  system: { Icon: IconActivity, tone: 'bg-neutral-100 text-neutral-500 ring-neutral-500/15' },
};

const COMPOSER_TYPES = ['note', 'call', 'email', 'meeting', 'site_visit'];

export function LeadTimeline({ leadId }) {
  const { data: activities, isLoading, isError, error } = useLeadActivities(leadId);
  const addActivity = useAddActivity(leadId);
  const [body, setBody] = useState('');
  const [type, setType] = useState('note');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    addActivity.mutate({ type, body: body.trim() }, { onSuccess: () => setBody('') });
  };

  return (
    <div>
      {/* ---- Composer ------------------------------------------------------ */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-border bg-surface-muted/50 p-3 transition-colors focus-within:border-brand-300 focus-within:bg-surface"
      >
        <Textarea
          rows={2}
          placeholder="Log a call, note or site visit…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={4000}
          className="bg-surface"
        />
        <div className="flex items-center justify-between gap-3 mt-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {COMPOSER_TYPES.map((t) => {
              const { Icon } = TYPES[t];
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-fg-muted hover:bg-surface-muted hover:text-fg'
                  )}
                >
                  <Icon size={12} />
                  {ACTIVITY_LABELS[t]}
                </button>
              );
            })}
          </div>
          <Button
            type="submit"
            size="sm"
            loading={addActivity.isPending}
            disabled={!body.trim()}
            rightIcon={<IconArrowRight size={13} />}
          >
            Add
          </Button>
        </div>
      </form>

      {/* ---- Feed ---------------------------------------------------------- */}
      {isLoading ? (
        <SkeletonText lines={5} />
      ) : isError ? (
        <p className="text-sm text-danger-600">{error.message}</p>
      ) : !activities.length ? (
        <EmptyState
          icon={<IconActivity size={22} />}
          title="No activity yet"
          description="Notes, calls and stage changes will appear here as a running history."
        />
      ) : (
        <ol className="relative">
          {/* Continuous rail behind the glyphs. */}
          <span className="absolute left-4 top-3 bottom-3 w-px bg-border" aria-hidden="true" />

          {activities.map((a, i) => {
            const { Icon, tone } = TYPES[a.type] ?? TYPES.system;
            return (
              <li
                key={a.id}
                className="relative flex gap-3.5 pb-5 last:pb-0 animate-slide-up"
                style={{ animationDelay: `${Math.min(i, 10) * 20}ms` }}
              >
                <span
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-inset ring-offset-2 ring-offset-surface',
                    tone
                  )}
                >
                  <Icon size={14} />
                </span>

                <div className="min-w-0 flex-1 -mt-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-fg">{ACTIVITY_LABELS[a.type] ?? a.type}</p>
                    <DateText value={a.createdAt} relative className="text-xs text-fg-subtle shrink-0" />
                  </div>

                  {a.type === 'stage_change' && a.toStage && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {a.fromStage && (
                        <>
                          <StageBadge stage={a.fromStage} dot={false} />
                          <IconArrowRight size={11} className="text-fg-subtle" />
                        </>
                      )}
                      <StageBadge stage={a.toStage} dot={false} />
                    </div>
                  )}

                  {a.body && (
                    <p className="text-sm text-fg-muted mt-1 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                  )}

                  <div className="flex items-center gap-1.5 mt-2">
                    <Avatar name={a.userName} size="xs" />
                    <span className="text-xs text-fg-subtle">{a.userName ?? 'System'}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
