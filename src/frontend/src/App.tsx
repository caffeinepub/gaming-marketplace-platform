import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';
import Checkout from './pages/Checkout';
import LoginQueue from './components/auth/LoginQueue';
import UsernameSetup from './components/auth/UsernameSetup';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useHasUsername } from './hooks/useQueries';

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: hasUsername, isLoading: usernameLoading, isFetched: usernameFetched } = useHasUsername();

  const [queueComplete, setQueueComplete] = useState(false);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  // Reset queue state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setQueueComplete(false);
      setShowUsernameSetup(false);
    }
  }, [isAuthenticated]);

  // Handle queue completion
  const handleQueueComplete = () => {
    setQueueComplete(true);
  };

  // Determine what to show after queue completes
  useEffect(() => {
    if (queueComplete && usernameFetched && !usernameLoading) {
      if (hasUsername === false) {
        setShowUsernameSetup(true);
      }
    }
  }, [queueComplete, hasUsername, usernameLoading, usernameFetched]);

  // Show queue if authenticated and queue not complete
  if (isAuthenticated && !queueComplete) {
    return <LoginQueue onQueueComplete={handleQueueComplete} />;
  }

  // Show username setup if queue complete but no username
  if (isAuthenticated && queueComplete && showUsernameSetup && hasUsername === false) {
    return <UsernameSetup onComplete={() => setShowUsernameSetup(false)} />;
  }

  // Show main app if not authenticated or all setup complete
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: AppContent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Storefront,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanel,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: Checkout,
});

const routeTree = rootRoute.addChildren([indexRoute, adminRoute, checkoutRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
