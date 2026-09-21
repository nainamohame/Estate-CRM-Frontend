import { cn } from '../../lib/cn';

export function Label({ required, className, children, ...props }) {
  return (
    <label className={cn('block text-sm font-medium text-fg mb-1.5', className)} {...props}>
      {children}
      {required && <span className="text-danger-600 ml-0.5">*</span>}
    </label>
  );
}
