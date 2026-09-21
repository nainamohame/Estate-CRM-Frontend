import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/patterns/PageHeader';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { SkeletonCards } from '../../components/ui/skeleton';
import { EmptyState, ErrorState } from '../../components/patterns/EmptyState';
import { MoneyText } from '../../components/patterns/MoneyText';
import { IconPlus, IconBuilding, IconMapPin, IconCalendar, IconLayers } from '../../components/ui/icons';
import { PROJECT_STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/format';
import { useProjects } from './hooks';
import { useAuth } from '../auth/useAuth';
import { useDisclosure } from '../../hooks/useDisclosure';
import { ProjectFormModal } from './components/ProjectFormModal';

const STATUS_TONE = {
  planning: 'neutral',
  under_construction: 'warning',
  ready_to_move: 'success',
  sold_out: 'danger',
};

/** Each project gets a deterministic cover gradient, keyed off its name. */
const COVERS = [
  'from-brand-600 via-brand-700 to-brand-900',
  'from-teal-600 via-brand-700 to-brand-900',
  'from-accent-600 via-accent-700 to-brand-900',
  'from-purple-600 via-brand-700 to-brand-900',
];

function coverFor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return COVERS[hash % COVERS.length];
}

export function ProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects, isLoading, isError, error, refetch } = useProjects();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div>
      <PageHeader
        title="Properties"
        icon={<IconBuilding size={19} />}
        description="Projects, buildings and unit inventory."
        actions={
          user?.role === 'admin' && (
            <Button leftIcon={<IconPlus size={15} />} onClick={onOpen}>
              New Project
            </Button>
          )
        }
      />

      {isLoading ? (
        <SkeletonCards count={3} />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : !projects.length ? (
        <Card padding="none">
          <EmptyState
            icon={<IconBuilding size={24} />}
            title="No projects yet"
            description="Add your first project to start listing units for your team to sell."
            action={
              user?.role === 'admin' && (
                <Button size="sm" leftIcon={<IconPlus size={14} />} onClick={onOpen}>
                  New Project
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, i) => {
            const soldPct = p.totalUnits ? Math.round(((p.totalUnits - p.availableUnits) / p.totalUnits) * 100) : 0;

            return (
              <Card
                key={p.id}
                padding="none"
                hoverable
                onClick={() => navigate(`/properties/${p.id}`)}
                className="group overflow-hidden animate-slide-up"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                {/* Cover band — stands in for a project photograph. */}
                <div className={`relative h-24 bg-linear-to-br ${coverFor(p.name)}`}>
                  <div className="absolute inset-0 bg-grid opacity-10" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />
                  <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
                    <h3 className="text-md font-semibold text-white truncate drop-shadow-sm">{p.name}</h3>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                      <IconBuilding size={15} />
                    </span>
                  </div>
                  <Badge tone={STATUS_TONE[p.status]} className="absolute right-3 top-3 shadow-xs">
                    {PROJECT_STATUS_LABELS[p.status]}
                  </Badge>
                </div>

                <div className="p-4 space-y-3.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-fg-muted truncate">
                      <IconMapPin size={13} className="shrink-0 opacity-70" />
                      {p.locality ? `${p.locality}, ` : ''}
                      {p.city}
                    </span>
                    {p.possessionDate && (
                      <span className="flex items-center gap-1.5 text-xs text-fg-subtle shrink-0">
                        <IconCalendar size={12} />
                        {formatDate(p.possessionDate, { day: undefined })}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-fg">
                        {p.availableUnits} <span className="font-normal text-fg-muted">of {p.totalUnits} available</span>
                      </span>
                      <span className="text-fg-subtle tabular-nums">{soldPct}% sold</span>
                    </div>
                    <Progress
                      value={p.availableUnits}
                      max={p.totalUnits || 1}
                      size="sm"
                      tone={p.availableUnits === 0 ? 'danger' : soldPct > 80 ? 'warning' : 'success'}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                      <IconLayers size={12} />
                      {p.totalUnits} units
                    </span>
                    {p.minPrice && (
                      <span className="text-xs font-medium text-fg">
                        <MoneyText value={p.minPrice} /> – <MoneyText value={p.maxPrice} />
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ProjectFormModal open={isOpen} onClose={onClose} />
    </div>
  );
}
