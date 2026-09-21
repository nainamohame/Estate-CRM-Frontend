import { cn } from '../../lib/cn';
import { IconInfo, IconCheck, IconAlertTriangle, IconAlertCircle } from './icons';

const VARIANTS = {
  info: {
    wrap: 'bg-info-50 border-info-200/70 text-info-700',
    chip: 'bg-info-100 text-info-700',
    Icon: IconInfo,
  },
  success: {
    wrap: 'bg-success-50 border-success-200/70 text-success-700',
    chip: 'bg-success-100 text-success-700',
    Icon: IconCheck,
  },
  warning: {
    wrap: 'bg-warning-50 border-warning-200/70 text-warning-700',
    chip: 'bg-warning-100 text-warning-700',
    Icon: IconAlertTriangle,
  },
  danger: {
    wrap: 'bg-danger-50 border-danger-200/70 text-danger-700',
    chip: 'bg-danger-100 text-danger-700',
    Icon: IconAlertCircle,
  },
};

export function Alert({ variant = 'info', title, description, action, className, children }) {
  const { wrap, chip, Icon } = VARIANTS[variant];
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 shadow-xs', wrap, className)}>
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', chip)}>
        <Icon size={16} />
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className={cn('text-sm opacity-90', title && 'mt-0.5')}>{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
