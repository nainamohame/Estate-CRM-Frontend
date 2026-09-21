import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataTable } from '../../components/patterns/DataTable';
import { FilterBar } from '../../components/patterns/FilterBar';
import { MoneyText } from '../../components/patterns/MoneyText';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Tabs } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { LoadingState, ErrorState } from '../../components/patterns/EmptyState';
import {
  IconPlus,
  IconBuilding,
  IconMapPin,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconShield,
} from '../../components/ui/icons';
import {
  UNIT_TYPES,
  UNIT_TYPE_LABELS,
  AVAILABILITY_LABELS,
  PROJECT_STATUS_LABELS,
} from '../../lib/constants';
import { formatDate } from '../../lib/format';
import { useFilters } from '../../hooks/useFilters';
import { useDisclosure } from '../../hooks/useDisclosure';
import { useProject, useUnits } from './hooks';
import { useAuth } from '../auth/useAuth';
import { BuildingFormModal } from './components/BuildingFormModal';
import { UnitFormModal } from './components/UnitFormModal';
import { UnitDrawer } from './components/UnitDrawer';

const AVAILABILITY_TONE = { available: 'success', held: 'warning', booked: 'danger', blocked: 'neutral' };
const STATUS_TONE = {
  planning: 'neutral',
  under_construction: 'warning',
  ready_to_move: 'success',
  sold_out: 'danger',
};

export function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { filters, setFilter, clearFilters } = useFilters({ building: 'all' });
  const buildingModal = useDisclosure();
  const unitModal = useDisclosure();
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { data: project, isLoading, isError, error, refetch } = useProject(id);

  const buildingId = filters.building !== 'all' ? filters.building : undefined;
  const queryFilters = useMemo(
    () => ({
      projectId: id,
      buildingId,
      unitType: filters.unitType || undefined,
      availability: filters.availability || undefined,
      page: filters.page ? Number(filters.page) : 1,
      pageSize: 20,
    }),
    [id, buildingId, filters.unitType, filters.availability, filters.page]
  );
  const unitsQuery = useUnits(queryFilters);

  if (isLoading) return <LoadingState label="Loading project…" />;
  if (isError) return <ErrorState description={error.message} onRetry={refetch} />;

  const hasActiveFilters = Boolean(
    filters.unitType || filters.availability || (filters.building && filters.building !== 'all')
  );
  const totalUnits = project.buildings.reduce((s, b) => s + b.totalUnits, 0);
  const availableUnits = project.buildings.reduce((s, b) => s + b.availableUnits, 0);
  const soldPct = totalUnits ? Math.round(((totalUnits - availableUnits) / totalUnits) * 100) : 0;

  const columns = [
    {
      key: 'unitNumber',
      header: 'Unit',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-[0.6875rem] font-semibold text-fg-muted ring-1 ring-inset ring-border">
            {u.floor ?? '–'}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-fg">{u.unitNumber}</p>
            <p className="text-xs text-fg-subtle truncate">{u.buildingName}</p>
          </div>
        </div>
      ),
    },
    { key: 'unitType', header: 'Type', render: (u) => <Badge tone="brand">{UNIT_TYPE_LABELS[u.unitType]}</Badge> },
    {
      key: 'carpetAreaSqft',
      header: 'Area',
      align: 'right',
      hideBelow: 'lg',
      render: (u) => (u.carpetAreaSqft ? <span className="text-fg-muted">{u.carpetAreaSqft} sq.ft</span> : '—'),
    },
    {
      key: 'facing',
      header: 'Facing',
      hideBelow: 'lg',
      render: (u) => <span className="text-fg-muted">{u.facing ?? '—'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (u) => <MoneyText value={u.price} className="font-semibold" />,
    },
    {
      key: 'availability',
      header: 'Status',
      render: (u) => (
        <Badge tone={AVAILABILITY_TONE[u.availability]} dot>
          {AVAILABILITY_LABELS[u.availability]}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (u) =>
        u.availability === 'available' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bookings?unitId=${u.id}&action=new`);
            }}
          >
            Book
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-fg-subtle">
        <button onClick={() => navigate('/properties')} className="hover:text-brand-700 transition-colors">
          Properties
        </button>
        <IconChevronRight size={12} className="opacity-60" />
        <span className="text-fg-muted font-medium truncate">{project.name}</span>
      </nav>

      {/* ---- Project hero -------------------------------------------------- */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative bg-linear-to-br from-brand-800 via-brand-700 to-brand-900 px-6 py-6">
          <div className="absolute inset-0 bg-grid opacity-[0.07]" />
          <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <button
                onClick={() => navigate('/properties')}
                aria-label="Back to properties"
                className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15 hover:text-white"
              >
                <IconChevronLeft size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-white truncate tracking-[-0.02em]">{project.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-brand-100">
                  <span className="flex items-center gap-1.5">
                    <IconMapPin size={14} />
                    {project.locality ? `${project.locality}, ` : ''}
                    {project.city}
                  </span>
                  {project.possessionDate && (
                    <span className="flex items-center gap-1.5">
                      <IconCalendar size={14} />
                      Possession {formatDate(project.possessionDate)}
                    </span>
                  )}
                  {project.reraNumber && (
                    <span className="flex items-center gap-1.5">
                      <IconShield size={14} />
                      {project.reraNumber}
                    </span>
                  )}
                </div>
                <Badge tone={STATUS_TONE[project.status]} className="mt-3 shadow-xs">
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" leftIcon={<IconBuilding size={15} />} onClick={buildingModal.onOpen}>
                  Add Building
                </Button>
                <Button leftIcon={<IconPlus size={15} />} onClick={unitModal.onOpen}>
                  Add Unit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Inventory summary strip, flush under the hero. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border border-t border-border bg-surface">
          <SummaryTile label="Buildings" value={project.buildings.length} />
          <SummaryTile label="Total units" value={totalUnits} />
          <SummaryTile label="Available" value={availableUnits} tone="text-success-700" />
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Sold</p>
            <p className="text-xl font-semibold text-fg mt-1 tabular-nums">{soldPct}%</p>
            <Progress
              value={totalUnits - availableUnits}
              max={totalUnits || 1}
              size="xs"
              tone={soldPct > 80 ? 'warning' : 'brand'}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <FilterBar onClearAll={hasActiveFilters ? clearFilters : undefined}>
        <Tabs
          variant="pill"
          value={filters.building ?? 'all'}
          onChange={(v) => setFilter('building', v)}
          tabs={[
            { value: 'all', label: 'All buildings' },
            ...project.buildings.map((b) => ({ value: b.id, label: b.name, count: b.availableUnits })),
          ]}
        />
        <Select
          value={filters.unitType ?? ''}
          onChange={(e) => setFilter('unitType', e.target.value)}
          placeholder="All types"
          className="w-full sm:w-36"
        >
          {UNIT_TYPES.map((t) => (
            <option key={t} value={t}>
              {UNIT_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.availability ?? ''}
          onChange={(e) => setFilter('availability', e.target.value)}
          placeholder="All statuses"
          className="w-full sm:w-40"
        >
          {Object.entries(AVAILABILITY_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={unitsQuery.data?.data}
        rowKey={(row) => row.id}
        loading={unitsQuery.isLoading}
        isFetching={unitsQuery.isFetching && !unitsQuery.isLoading}
        error={unitsQuery.error}
        onRetry={unitsQuery.refetch}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onRowClick={setSelectedUnit}
        empty={{
          icon: <IconBuilding size={24} />,
          title: 'No units here',
          description: 'Add a unit to this project so your team has something to sell.',
        }}
        pagination={
          unitsQuery.data
            ? {
                page: unitsQuery.data.meta.page,
                pageSize: unitsQuery.data.meta.pageSize,
                total: unitsQuery.data.meta.total,
                onPageChange: (p) => setFilter('page', p),
              }
            : undefined
        }
      />

      <BuildingFormModal open={buildingModal.isOpen} onClose={buildingModal.onClose} projectId={id} />
      <UnitFormModal open={unitModal.isOpen} onClose={unitModal.onClose} buildings={project.buildings} />
      <UnitDrawer
        open={Boolean(selectedUnit)}
        unit={selectedUnit}
        onClose={() => setSelectedUnit(null)}
        onBook={(u) => navigate(`/bookings?unitId=${u.id}&action=new`)}
      />
    </div>
  );
}

function SummaryTile({ label, value, tone = 'text-fg' }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">{label}</p>
      <p className={`text-xl font-semibold mt-1 tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
