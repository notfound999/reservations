import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, User, Building2, Calendar, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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

          {/* Search Bar - Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search businesses, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 rounded-l-full rounded-r-none border-r-0 bg-secondary/50 focus:bg-background"
                  aria-label="Search businesses and services"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-r-full rounded-l-none border-l-0 bg-secondary/50 hover:bg-accent"
                aria-label="Search filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right Actions */}
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
