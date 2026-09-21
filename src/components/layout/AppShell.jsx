import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/follow-ups': 'Follow-ups',
  '/properties': 'Properties',
  '/bookings': 'Bookings',
  '/team': 'Team',
};

function titleFor(pathname) {
  const match = Object.keys(TITLES).find((p) => pathname === p || pathname.startsWith(`${p}/`));
  return TITLES[match] ?? 'Estate CRM';
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar title={titleFor(location.pathname)} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 max-w-[90rem] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
