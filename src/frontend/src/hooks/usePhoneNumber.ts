import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useHasPhoneNumber() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<boolean>({
    queryKey: ['hasPhoneNumber'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.hasPhoneNumber();
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

export function useSavePhoneNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!actor) throw new Error('Actor not available');
      
      // Validate phone number on frontend before sending to backend
      const digitsOnly = phoneNumber.replace(/\D/g, '');
      
      if (digitsOnly.length === 0) {
        throw new Error('Phone number is required');
      }
      
      if (phoneNumber.includes('+')) {
        throw new Error('Phone number must not include the + prefix');
      }
      
      return actor.savePhoneNumber(digitsOnly);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasPhoneNumber'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
