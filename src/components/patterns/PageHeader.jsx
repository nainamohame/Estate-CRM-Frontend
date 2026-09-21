import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { IconChevronLeft, IconChevronRight } from '../ui/icons';

/**
 * @param {object} props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.icon]        gradient chip beside the title
 * @param {{label: string, to?: string}[]} [props.breadcrumbs]
 * @param {string} [props.backTo]
 * @param {React.ReactNode} [props.actions]
 */
export function PageHeader({ title, description, icon, breadcrumbs, backTo, actions, className }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        {breadcrumbs && (
          <nav className="flex items-center gap-1.5 text-sm text-fg-subtle mb-2 flex-wrap">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <IconChevronRight size={12} className="opacity-60" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-brand-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-fg-muted font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {backTo && (
            <Link
              to={backTo}
              aria-label="Back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-surface text-fg-muted shadow-xs transition-colors hover:border-border-strong hover:text-fg"
            >
              <IconChevronLeft size={18} />
            </Link>
          )}
          {icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-sm ring-1 ring-inset ring-white/20">
              {icon}
            </span>
          )}
          <h1 className="text-2xl font-semibold text-fg truncate tracking-[-0.02em]">{title}</h1>
        </div>

        {description && <div className="text-sm text-fg-muted mt-1.5">{description}</div>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
