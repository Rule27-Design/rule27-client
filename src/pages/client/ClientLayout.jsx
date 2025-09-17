// src/pages/client/ClientLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ClientLayout = ({ userProfile, setUserProfile }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    { name: 'Projects', path: '/projects', icon: 'Briefcase' },
    { name: 'Invoices', path: '/invoices', icon: 'FileText' },
    { name: 'Support', path: '/support', icon: 'MessageCircle' },
    { name: 'Profile', path: '/profile', icon: 'User' },
  ];

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
              </button>
              <Link to="/" className="flex items-center space-x-3">
                <img 
                  src="/assets/Logo/rule27-icon-color.png" 
                  alt="Rule27" 
                  className="w-8 h-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 bg-accent rounded-full flex items-center justify-center';
                    fallback.innerHTML = '<span class="text-white font-bold">27</span>';
                    e.target.parentElement.appendChild(fallback);
                  }}
                />
                <span className="font-heading-bold text-xl">CLIENT PORTAL</span>
              </Link>
            </div>

            <nav className="hidden lg:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md
                    ${isActivePath(item.path)
                      ? 'text-accent'
                      : 'text-gray-700 hover:text-accent'
                    }
                  `}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              iconName="LogOut"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b">
          <nav className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md
                  ${isActivePath(item.path)
                    ? 'bg-accent text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ userProfile }} />
      </main>
    </div>
  );
};

export default ClientLayout;