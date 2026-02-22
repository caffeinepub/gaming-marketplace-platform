import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Product, Category, CartItem, UserProfile, PaymentConfig, ProductType, UserRole, QueueSkipSubmission, GiftCardType, CustomUsernameSubmission, PaymentMethod } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

// Username Queries
export function useHasUsername() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['hasUsername'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasUsername();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUsername() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string | null>({
    queryKey: ['username'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      const principal = identity.getPrincipal();
      return actor.getUsername(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useCreateUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasUsername'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['username'] });
    },
  });
}

export function useIsAdminUsername() {
  const { actor } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdminUsername'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Get the user's profile to extract their username
      const profile = await actor.getCallerUserProfile();
      if (!profile || !profile.username) {
        return false;
      }
      
      // Check if the username is in the admin whitelist
      return actor.isAdminUsername(profile.username);
    },
    enabled: !!actor,
    retry: false,
  });
}

// Product Queries
export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Product }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(id, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, product }: { id: string; product: Product }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(id, product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Category Queries
export function useGetAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, category }: { name: string; category: Category }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCategory(name, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, category }: { name: string; category: Category }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCategory(name, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Cart Queries
export function useGetCart() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item added to cart');
    },
  });
}

export function useUpdateCartItemQuantity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCartItemQuantity(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// Payment Queries
export function useGetPaymentDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<PaymentConfig>({
    queryKey: ['paymentDetails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPaymentDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePaymentDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: PaymentConfig) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePaymentDetails(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentDetails'] });
    },
  });
}

export function useGetInstagramUrl() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['instagramUrl'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getInstagramUrl();
    },
    enabled: !!actor && !isFetching,
  });
}

// Queue Skip Queries
export function useHasQueueBypass() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['queueBypass'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasQueueBypass();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSubmitQueueSkipPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      giftCardType,
      giftCardCode,
    }: {
      transactionId: string;
      giftCardType: GiftCardType;
      giftCardCode: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitQueueSkipPayment(transactionId, giftCardType, giftCardCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueBypass'] });
    },
  });
}

export function useGetQueueSkipSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<QueueSkipSubmission[]>({
    queryKey: ['queueSkipSubmissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getQueueSkipSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFlagQueueSkipFraud() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.flagQueueSkipFraud(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queueSkipSubmissions'] });
    },
  });
}

// Custom Username Queries
export function useSubmitCustomUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestedUsername,
      paymentMethod,
      transactionDetails,
    }: {
      requestedUsername: string;
      paymentMethod: PaymentMethod;
      transactionDetails: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitCustomUsername(requestedUsername, paymentMethod, transactionDetails);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customUsernameSubmissions'] });
    },
  });
}

export function useGetCustomUsernameSubmissions() {
  const { actor, isFetching } = useActor();

  return useQuery<CustomUsernameSubmission[]>({
    queryKey: ['customUsernameSubmissions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomUsernameSubmissions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveCustomUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveCustomUsername(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customUsernameSubmissions'] });
    },
  });
}

export function useRejectCustomUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectCustomUsername(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customUsernameSubmissions'] });
    },
  });
}

export function useValidateGeneratedUsername() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.validateGeneratedUsername(username);
    },
  });
}
