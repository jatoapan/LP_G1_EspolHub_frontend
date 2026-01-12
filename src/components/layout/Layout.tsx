import { ReactNode } from 'react';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: ReactNode;
  isLoggedIn?: boolean;
  user?: {
    name: string;
    avatar: string;
  };
}

export const Layout = ({ children, isLoggedIn = false, user }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isLoggedIn={isLoggedIn} user={user} />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav isLoggedIn={isLoggedIn} />
    </div>
  );
};
