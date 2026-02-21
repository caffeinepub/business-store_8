import { Link, useRouterState } from '@tanstack/react-router';
import { ShoppingBag } from 'lucide-react';
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
      
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">Business Store</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentPath === '/' ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Products
            </Link>
            
            {identity && isAdmin && (
              <>
                <Link
                  to="/admin/products"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPath === '/admin/products' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Manage Products
                </Link>
                <Link
                  to="/admin/orders"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPath === '/admin/orders' ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Orders
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

      <footer className="border-t border-border/40 bg-muted/30 py-8 mt-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Business Store. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'business-store'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
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

