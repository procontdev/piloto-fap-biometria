import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  UserPlusIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon, roles: ['Supervisor'] },
  { name: 'Bandeja', href: '/registrations', icon: ClipboardDocumentListIcon, roles: ['Operador', 'Supervisor'] },
  { name: 'Nuevo Registro', href: '/registrations/new', icon: UserPlusIcon, roles: ['Operador'] },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-primary-900 text-white flex flex-col">
        <div className="p-4 flex items-center mb-6 mt-4">
          <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg tracking-wide">FAP Piloto</div>
            <div className="text-xs text-primary-300">Inscripción Digital</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2">
          {navItems
            .filter(item => item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-700 text-white'
                      : 'text-primary-200 hover:bg-primary-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
        </nav>

        <div className="p-4 bg-primary-950 border-t border-primary-800">
          <div className="flex items-center">
            <div className="flex-1 truncate">
              <div className="text-sm font-medium text-white truncate">{user.fullName}</div>
              <div className="text-xs text-primary-300 truncate">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 p-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800"
              title="Cerrar Sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header (Top Nav) */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
            <h1 className="text-slate-800 font-semibold text-lg flex-1">
                Piloto Institucional
            </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
