import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu, X, User, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar: string;
  };
}

export const Header = ({ isLoggedIn = false, user }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">
            Espol<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos, libros, servicios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-secondary/50 border-transparent focus:border-primary focus:bg-card"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button asChild className="gap-2 shadow-primary hover:shadow-lg transition-shadow">
                <Link to="/publish">
                  <Plus className="h-4 w-4" />
                  Vender
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user?.name || 'Usuario'}</p>
                      <p className="text-xs text-muted-foreground">Ver perfil</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=listings" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      Mis Anuncios
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile?tab=settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Ingresar</Link>
              </Button>
              <Button asChild className="shadow-primary hover:shadow-lg transition-shadow">
                <Link to="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Search - Always visible on mobile */}
      <div className="container pb-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-secondary/50 border-transparent focus:border-primary"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border md:hidden animate-slide-up">
          <nav className="container py-4 space-y-2">
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Mi Perfil
                </Link>
                <Link
                  to="/profile?tab=listings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  Mis Anuncios
                </Link>
                <Link
                  to="/publish"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="h-5 w-5" />
                  Vender
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-lg hover:bg-secondary text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-lg bg-primary text-primary-foreground text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
