import { Link, useRouterState } from '@tanstack/react-router';
import { Store } from 'lucide-react';
import LoginButton from './LoginButton';
import CartButton from './CartButton';
import UserProfileSetup from './UserProfileSetup';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UserProfileSetup />
      
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:shadow-glow transition-shadow">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              OM FANCY
            </span>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-semibold transition-all hover:text-primary relative ${
                currentPath === '/' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Products
              {currentPath === '/' && (
                <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
              )}
            </Link>
            
            {identity && isAdmin && (
              <>
                <Link
                  to="/admin/products"
                  className={`text-sm font-semibold transition-all hover:text-primary relative ${
                    currentPath === '/admin/products' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Manage Products
                  {currentPath === '/admin/products' && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                </Link>
                <Link
                  to="/admin/orders"
                  className={`text-sm font-semibold transition-all hover:text-primary relative ${
                    currentPath === '/admin/orders' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Orders
                  {currentPath === '/admin/orders' && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                  )}
                </Link>
              </>
            )}

            {identity && <CartButton />}
            <LoginButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-muted/20 py-10 mt-20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OM FANCY. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'om-fancy'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
