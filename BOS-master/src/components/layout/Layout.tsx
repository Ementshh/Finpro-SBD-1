import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { School, BarChart3, LineChart, ClipboardCheck, FileText, LogOut, Menu, X, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'School Rankings', href: '/rankings', icon: LineChart },
    { name: 'Review System', href: user ? '/review/new' : '/login', icon: ClipboardCheck },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <School className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">BOS Monitor</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm text-red-700 rounded-md hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/login"
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      />

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <School className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">BOS Monitor</span>
          </Link>
          <button onClick={toggleMobileMenu} className="text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={toggleMobileMenu}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm text-red-700 rounded-md hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/login"
              onClick={toggleMobileMenu}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm lg:hidden">
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <button onClick={toggleMobileMenu} className="text-gray-500">
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <School className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-semibold text-gray-900">BOS Monitor</span>
              </Link>
            </div>
            {user && (
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;