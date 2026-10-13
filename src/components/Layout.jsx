import {
  ArrowRight,
  BarChart3,
  Building2,
  LayoutDashboard,
  Leaf,
  LogOut,
  Users,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', to: '/reports/meetings', icon: BarChart3 },
  { label: 'People', to: '/people', icon: Users },
  { label: 'Sustainability', to: '/sustainability', icon: Leaf },
];

function getVisibleNav(user) {
  if (!user) return [];
  const items = [...navConfig];
  if (user.role === 'employee') {
    return items.filter((item) => item.to !== '/people');
  }
  return items;
}

function titleFromPath(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/people') return 'People';
  if (pathname === '/sustainability') return 'Sustainability';
  if (pathname.startsWith('/reports/')) return 'KPI Reports';
  if (pathname.startsWith('/people/')) return 'Employee Overview';
  return 'Overview';
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getVisibleNav(user);

  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const path = `/${arr.slice(0, index + 1).join('/')}`;
      const label = segment === 'reports' ? 'Reports' : segment === 'people' ? 'People' : segment;
      return { path, label: label.replace('-', ' ') };
    });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-5">
          <div className="rounded-xl bg-blue-600 p-2">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Workplace</div>
            <div className="text-xs text-slate-400">Sustainability</div>
          </div>
        </div>

        <nav className="space-y-2 px-3 py-5">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute inset-x-3 bottom-4 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
          <div className="mb-1 text-xs uppercase tracking-[0.15em] text-slate-400">Signed in</div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{user?.name || 'User'}</div>
              <div className="text-xs text-slate-400">{user?.role || 'employee'}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm text-slate-200" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        <header className="border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Overview</div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{titleFromPath(location.pathname)}</h1>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link to="/dashboard" className="hover:text-slate-900">Home</Link>
              {breadcrumbs.length > 0 && <ArrowRight className="h-4 w-4" />}
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  {index > 0 && <ArrowRight className="h-4 w-4" />}
                  <span className={index === breadcrumbs.length - 1 ? 'font-medium text-slate-700' : ''}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </nav>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
