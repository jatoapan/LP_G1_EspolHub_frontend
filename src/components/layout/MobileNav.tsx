import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isLoggedIn?: boolean;
}

const navItems = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Search, label: 'Explorar', path: '/explore' },
  { icon: PlusCircle, label: 'Vender', path: '/publish', highlight: true },
  { icon: User, label: 'Perfil', path: '/profile', authRequired: true },
];

export const MobileNav = ({ isLoggedIn = false }: MobileNavProps) => {
  const location = useLocation();

  const getPath = (item: typeof navItems[0]) => {
    if (item.authRequired && !isLoggedIn) {
      return '/login';
    }
    return item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden supports-[backdrop-filter]:bg-card/90">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const path = getPath(item);
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                item.highlight && "text-primary",
                isActive && !item.highlight && "text-primary",
                !isActive && !item.highlight && "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", item.highlight && "h-6 w-6")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};
