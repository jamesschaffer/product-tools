import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { initiativesApi } from '../lib/api';
import type { Initiative } from '../types';

export function useInitiativesQuery() {
  return useQuery({
    queryKey: queryKeys.initiatives(),
    queryFn: initiativesApi.fetchAll,
  });
}

export function useCreateInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (initiative: Omit<Initiative, 'id'>) => initiativesApi.create(initiative),
    onMutate: async (newInitiative) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives() });
      const previousInitiatives = queryClient.getQueryData<Initiative[]>(queryKeys.initiatives());

      const optimisticInitiative: Initiative = {
        ...newInitiative,
        id: `temp-${Date.now()}`,
      };

      queryClient.setQueryData<Initiative[]>(queryKeys.initiatives(), (old) =>
        old ? [...old, optimisticInitiative] : [optimisticInitiative]
      );

      return { previousInitiatives };
    },
    onError: (_err, _newInitiative, context) => {
      if (context?.previousInitiatives) {
        queryClient.setQueryData(queryKeys.initiatives(), context.previousInitiatives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives() });
    },
  });
}

export function useUpdateInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Initiative> }) =>
      initiativesApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives() });
      const previousInitiatives = queryClient.getQueryData<Initiative[]>(queryKeys.initiatives());

      queryClient.setQueryData<Initiative[]>(queryKeys.initiatives(), (old) =>
        old?.map((i) => (i.id === id ? { ...i, ...updates } : i))
      );

      return { previousInitiatives };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousInitiatives) {
        queryClient.setQueryData(queryKeys.initiatives(), context.previousInitiatives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives() });
    },
  });
}

export function useDeleteInitiative() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => initiativesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives() });
      await queryClient.cancelQueries({ queryKey: queryKeys.deliverables() });

      const previousInitiatives = queryClient.getQueryData<Initiative[]>(queryKeys.initiatives());

      queryClient.setQueryData<Initiative[]>(queryKeys.initiatives(), (old) =>
        old?.filter((i) => i.id !== id)
      );

      return { previousInitiatives };
    },
    onError: (_err, _id, context) => {
      if (context?.previousInitiatives) {
        queryClient.setQueryData(queryKeys.initiatives(), context.previousInitiatives);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.initiatives() });
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables() });
    },
  });
}
