import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { goalsApi } from '../lib/api';
import type { Goal } from '../types';

export function useGoalsQuery() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: goalsApi.fetchAll,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goal: Omit<Goal, 'id'>) => goalsApi.create(goal),
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals() });
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals());

      // Optimistically add the goal with a temp ID
      const optimisticGoal: Goal = {
        ...newGoal,
        id: `temp-${Date.now()}`,
      };

      queryClient.setQueryData<Goal[]>(queryKeys.goals(), (old) =>
        old ? [...old, optimisticGoal] : [optimisticGoal]
      );

      return { previousGoals };
    },
    onError: (_err, _newGoal, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals(), context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalsApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals() });
      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals());

      queryClient.setQueryData<Goal[]>(queryKeys.goals(), (old) =>
        old?.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );

      return { previousGoals };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals(), context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals() });
      await queryClient.cancelQueries({ queryKey: queryKeys.initiatives() });
      await queryClient.cancelQueries({ queryKey: queryKeys.deliverables() });

      const previousGoals = queryClient.getQueryData<Goal[]>(queryKeys.goals());

      // Optimistically remove the goal
      queryClient.setQueryData<Goal[]>(queryKeys.goals(), (old) =>
        old?.filter((g) => g.id !== id)
      );

      return { previousGoals };
    },
    onError: (_err, _id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals(), context.previousGoals);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}
