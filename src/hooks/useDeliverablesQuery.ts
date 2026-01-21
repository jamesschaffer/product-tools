import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { deliverablesApi } from '../lib/api';
import type { Deliverable } from '../types';

export function useDeliverablesQuery() {
  return useQuery({
    queryKey: queryKeys.deliverables(),
    queryFn: deliverablesApi.fetchAll,
  });
}

export function useCreateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliverable: Omit<Deliverable, 'id'>) => deliverablesApi.create(deliverable),
    onMutate: async (newDeliverable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deliverables() });
      const previousDeliverables = queryClient.getQueryData<Deliverable[]>(queryKeys.deliverables());

      const optimisticDeliverable: Deliverable = {
        ...newDeliverable,
        id: `temp-${Date.now()}`,
      };

      queryClient.setQueryData<Deliverable[]>(queryKeys.deliverables(), (old) =>
        old ? [...old, optimisticDeliverable] : [optimisticDeliverable]
      );

      return { previousDeliverables };
    },
    onError: (_err, _newDeliverable, context) => {
      if (context?.previousDeliverables) {
        queryClient.setQueryData(queryKeys.deliverables(), context.previousDeliverables);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables() });
    },
  });
}

export function useUpdateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Deliverable> }) =>
      deliverablesApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deliverables() });
      const previousDeliverables = queryClient.getQueryData<Deliverable[]>(queryKeys.deliverables());

      queryClient.setQueryData<Deliverable[]>(queryKeys.deliverables(), (old) =>
        old?.map((d) => (d.id === id ? { ...d, ...updates } : d))
      );

      return { previousDeliverables };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDeliverables) {
        queryClient.setQueryData(queryKeys.deliverables(), context.previousDeliverables);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables() });
    },
  });
}

export function useDeleteDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliverablesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deliverables() });
      const previousDeliverables = queryClient.getQueryData<Deliverable[]>(queryKeys.deliverables());

      queryClient.setQueryData<Deliverable[]>(queryKeys.deliverables(), (old) =>
        old?.filter((d) => d.id !== id)
      );

      return { previousDeliverables };
    },
    onError: (_err, _id, context) => {
      if (context?.previousDeliverables) {
        queryClient.setQueryData(queryKeys.deliverables(), context.previousDeliverables);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliverables() });
    },
  });
}
