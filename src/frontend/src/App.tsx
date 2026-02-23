import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';
import Checkout from './pages/Checkout';
import LoginQueue from './components/auth/LoginQueue';
import TermsAcceptanceModal from './components/auth/TermsAcceptanceModal';
import IdClaimDialog from './components/auth/IdClaimDialog';
import AIUsernameGenerator from './components/auth/AIUsernameGenerator';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useHasUsername, useHasQueueBypass, useGetCallerUserProfile } from './hooks/useQueries';

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: hasUsername, isLoading: usernameLoading, isFetched: usernameFetched } = useHasUsername();
  const { data: hasQueueBypass, isLoading: bypassLoading, isFetched: bypassFetched } = useHasQueueBypass();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const [queueComplete, setQueueComplete] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idClaimed, setIdClaimed] = useState(false);
  const [showUsernameGenerator, setShowUsernameGenerator] = useState(false);

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setQueueComplete(false);
      setTermsAccepted(false);
      setIdClaimed(false);
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

  // Handle ID claim completion
  const handleIdClaimComplete = () => {
    setIdClaimed(true);
  };

  // Check if user has a 6-character ID
  const hasUserId = userProfile?.userId && userProfile.userId.length === 6;

  // Determine what to show after queue completes
  useEffect(() => {
    if (queueComplete && usernameFetched && !usernameLoading && profileFetched && !profileLoading) {
      if (!termsAccepted) {
        // Show terms acceptance first
      } else if (termsAccepted && !hasUserId && !idClaimed) {
        // Show ID claim dialog after terms
      } else if (hasUsername === false && termsAccepted && (hasUserId || idClaimed)) {
        setShowUsernameGenerator(true);
      }
    }
  }, [queueComplete, hasUsername, usernameLoading, usernameFetched, termsAccepted, hasUserId, profileLoading, profileFetched, idClaimed]);

  // Show queue if authenticated and queue not complete (and no bypass)
  if (isAuthenticated && !queueComplete && !bypassLoading) {
    return <LoginQueue onQueueComplete={handleQueueComplete} />;
  }

  // Show terms acceptance if queue complete but terms not accepted
  if (isAuthenticated && queueComplete && !termsAccepted && usernameFetched) {
    return <TermsAcceptanceModal onAccept={() => setTermsAccepted(true)} />;
  }

  // Show ID claim dialog if terms accepted but no 6-character ID
  if (isAuthenticated && queueComplete && termsAccepted && !hasUserId && profileFetched && !idClaimed) {
    return <IdClaimDialog open={true} onComplete={handleIdClaimComplete} />;
  }

  // Show AI username generator if terms accepted, ID claimed, but no username
  if (isAuthenticated && queueComplete && termsAccepted && (hasUserId || idClaimed) && showUsernameGenerator && hasUsername === false) {
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
