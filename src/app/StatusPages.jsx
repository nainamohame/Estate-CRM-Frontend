import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { IconAlertTriangle, IconShield } from '../components/ui/icons';

function StatusPage({ icon, code, title, description }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-fg-subtle mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-fg-subtle tracking-wide">{code}</p>
      <h1 className="text-2xl font-semibold text-fg mt-1">{title}</h1>
      <p className="text-sm text-fg-muted mt-2 max-w-sm">{description}</p>
      <Button as={Link} to="/dashboard" className="mt-6">
        Back to dashboard
      </Button>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <StatusPage
      icon={<IconShield size={24} />}
      code="403"
      title="Access restricted"
      description="This area is only available to administrators."
    />
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      icon={<IconAlertTriangle size={24} />}
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have moved."
    />
  );
}
