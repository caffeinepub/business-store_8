import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading } = useIsAdmin();

  if (isInitializing || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <div className="text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">
              Please log in to access the admin area.
            </p>
          </div>
          <Link to="/">
            <Button>Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <div className="text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this area. Admin privileges are required.
            </p>
          </div>
          <Link to="/">
            <Button>Return to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

