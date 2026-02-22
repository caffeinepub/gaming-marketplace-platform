import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';
import Checkout from './pages/Checkout';
import LoginQueue from './components/auth/LoginQueue';
import TermsAcceptanceModal from './components/auth/TermsAcceptanceModal';
import AIUsernameGenerator from './components/auth/AIUsernameGenerator';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useHasUsername, useHasQueueBypass } from './hooks/useQueries';

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: hasUsername, isLoading: usernameLoading, isFetched: usernameFetched } = useHasUsername();
  const { data: hasQueueBypass, isLoading: bypassLoading, isFetched: bypassFetched } = useHasQueueBypass();

  const [queueComplete, setQueueComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showUsernameGenerator, setShowUsernameGenerator] = useState(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setQueueComplete(false);
      setTermsAccepted(false);
      setShowUsernameGenerator(false);
    }
  }, [isAuthenticated]);

  // Handle queue completion
  const handleQueueComplete = () => {
    setQueueComplete(true);
  };

  // Check if user has queue bypass
  useEffect(() => {
    if (isAuthenticated && bypassFetched && hasQueueBypass) {
      setQueueComplete(true);
    }
  }, [isAuthenticated, bypassFetched, hasQueueBypass]);

  // Determine what to show after queue completes
  useEffect(() => {
    if (queueComplete && usernameFetched && !usernameLoading) {
      if (hasUsername === false && !termsAccepted) {
        // Show terms acceptance first
      } else if (hasUsername === false && termsAccepted) {
        setShowUsernameGenerator(true);
      }
    }
  }, [queueComplete, hasUsername, usernameLoading, usernameFetched, termsAccepted]);

  // Show queue if authenticated and queue not complete (and no bypass)
  if (isAuthenticated && !queueComplete && !bypassLoading) {
    return <LoginQueue onQueueComplete={handleQueueComplete} />;
  }

  // Show terms acceptance if queue complete but terms not accepted and no username
  if (isAuthenticated && queueComplete && !termsAccepted && hasUsername === false && usernameFetched) {
    return <TermsAcceptanceModal onAccept={() => setTermsAccepted(true)} />;
  }

  // Show AI username generator if terms accepted but no username
  if (isAuthenticated && queueComplete && termsAccepted && showUsernameGenerator && hasUsername === false) {
    return <AIUsernameGenerator onComplete={() => setShowUsernameGenerator(false)} />;
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
