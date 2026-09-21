import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LeadsPage } from '../features/leads/LeadsPage';
import { LeadDetailPage } from '../features/leads/LeadDetailPage';
import { FollowUpsPage } from '../features/followups/FollowUpsPage';
import { ProjectsPage } from '../features/properties/ProjectsPage';
import { ProjectDetailPage } from '../features/properties/ProjectDetailPage';
import { BookingsPage } from '../features/bookings/BookingsPage';
import { TeamPage } from '../features/team/TeamPage';
import { ForbiddenPage, NotFoundPage } from './StatusPages';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <ForbiddenPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'leads', element: <LeadsPage /> },
          { path: 'leads/:id', element: <LeadDetailPage /> },
          { path: 'follow-ups', element: <FollowUpsPage /> },
          { path: 'properties', element: <ProjectsPage /> },
          { path: 'properties/:id', element: <ProjectDetailPage /> },
          { path: 'bookings', element: <BookingsPage /> },
          {
            element: <RoleRoute role="admin" />,
            children: [{ path: 'team', element: <TeamPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
