import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" role="banner">
        <nav className="container flex h-14 md:h-16 items-center justify-between gap-4" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-gradient-warm hidden sm:block">BookIt</span>
          </Link>

          {/* Right Actions */}
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            {/* Desktop: List your Business button with text */}
            <Link to="/dashboard" className="hidden lg:block">
              <Button variant="ghost" className="gap-2">
                <Building2 className="h-4 w-4" />
                List your Business
              </Button>
            </Link>

            {/* Mobile: List your Business icon button (always visible) */}
            <Link to="/dashboard" className="md:hidden" aria-label="Business dashboard">
              <Button variant="ghost" size="icon" aria-label="List your business">
                <Building2 className="h-5 w-5" />
              </Button>
            </Link>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 px-3" aria-label="User menu">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground" aria-hidden="true">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {/* My Reservations only on desktop (mobile has it in bottom nav) */}
                  <DropdownMenuItem onClick={() => navigate('/reservations')} className="md:flex hidden">
                    <Calendar className="mr-2 h-4 w-4" />
                    My Reservations
                  </DropdownMenuItem>
                  {/* My Profile only on desktop (mobile has it in bottom nav) */}
                  <DropdownMenuItem onClick={() => navigate('/auth/profile')} className="md:flex hidden">
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:block hidden" />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </header>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navigation;
