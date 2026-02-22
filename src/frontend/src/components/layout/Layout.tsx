import { ReactNode, useState } from 'react';
import { Link } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import UserProfileSetup from '../auth/UserProfileSetup';
import CartDrawer from '../cart/CartDrawer';
import UsernameRegenerationDialog from '../profile/UsernameRegenerationDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserRole, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Gamepad2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userRole } = useGetCallerUserRole();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAdmin = userRole === 'admin';
  const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);

  const currentUsername = userProfile?.username;
  const hasUsername = !!currentUsername;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Gamepad2 className="h-7 w-7 text-primary" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GameVault
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              Store
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
                activeProps={{ className: 'text-primary' }}
              >
                Admin Panel
              </Link>
            )}
            {isAuthenticated && hasUsername && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentUsername}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUsernameDialogOpen(true)}
                  className="h-8 px-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isAuthenticated && <CartDrawer />}
            <LoginButton />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} GameVault</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>

      <UserProfileSetup />
      {isAuthenticated && hasUsername && (
        <UsernameRegenerationDialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen} />
      )}
    </div>
  );
}
