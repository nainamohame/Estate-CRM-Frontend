import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useAuth } from '../../features/auth/useAuth';
import {
  IconHome,
  IconUsers,
  IconClock,
  IconBuilding,
  IconClipboard,
  IconBriefcase,
  IconX,
  IconLogOut,
  IconMoreHorizontal,
} from '../ui/icons';
import { Avatar } from '../ui/avatar';
import { DropdownMenu, DropdownItem } from '../ui/dropdown-menu';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/leads', label: 'Leads', icon: IconUsers },
  { to: '/follow-ups', label: 'Follow-ups', icon: IconClock },
  { to: '/properties', label: 'Properties', icon: IconBuilding },
  { to: '/bookings', label: 'Bookings', icon: IconClipboard },
  { to: '/team', label: 'Team', icon: IconBriefcase, adminOnly: true },
];

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/50 backdrop-blur-[2px] lg:hidden animate-in"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col bg-gradient-sidebar transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand lockup */}
        <div className="flex items-center justify-between h-topbar px-5 shrink-0 border-b border-sidebar-border/60">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-sm ring-1 ring-inset ring-white/20">
              <IconBuilding size={17} />
            </span>
            <span className="text-md font-semibold text-white tracking-[-0.01em]">Estate CRM</span>
          </span>
          <button onClick={onCloseMobile} className="lg:hidden text-sidebar-fg hover:text-white transition-colors">
            <IconX size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-sidebar-fg/50">
            Workspace
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-linear-to-r from-brand-600/90 to-brand-700/50 text-white shadow-sm'
                    : 'text-sidebar-fg hover:bg-white/5 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator rail, flush to the sidebar edge. */}
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent-400 transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <item.icon size={17} className={cn('transition-transform', !isActive && 'group-hover:scale-110')} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border/60 p-3">
          <DropdownMenu
            trigger={
              <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5">
                <Avatar name={user?.fullName} size="sm" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-sm font-medium text-white truncate">{user?.fullName}</span>
                  <span className="block text-xs text-sidebar-fg capitalize">
                    {user?.role === 'admin' ? 'Administrator' : 'Sales Employee'}
                  </span>
                </span>
                <IconMoreHorizontal size={16} className="text-sidebar-fg shrink-0" />
              </button>
            }
          >
            <DropdownItem icon={<IconLogOut size={14} />} onClick={logout}>
              Sign out
            </DropdownItem>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}
