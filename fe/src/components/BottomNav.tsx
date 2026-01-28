import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'search', label: 'Search', icon: Search, path: '/search' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/reservations', requiresAuth: true },
    { id: 'profile', label: 'Profile', icon: null, path: '/auth/profile', requiresAuth: true, isAvatar: true },
  ];

  const handleTabClick = (tab: typeof tabs[0], e: React.MouseEvent) => {
    if (tab.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  const isActive = (path: string, tabId: string) => {
    if (tabId === 'home') {
      return location.pathname === '/';
    }
    if (tabId === 'search') {
      return location.pathname === '/search';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t pb-safe" role="navigation" aria-label="Mobile navigation">
        <div className="grid grid-cols-4 h-16" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path, tab.id);

            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={(e) => handleTabClick(tab, e)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors relative",
                  active ? "text-airbnb-primary" : "text-muted-foreground hover:text-foreground"
                )}
                role="tab"
                aria-selected={active}
                aria-label={tab.label}
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  {tab.isAvatar ? (
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold",
                      active ? "bg-airbnb-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  ) : (
                    Icon && <Icon className="h-6 w-6" />
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-airbnb-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium",
                  active && "font-semibold"
                )}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />
    </>
  );
};

export default BottomNav;
