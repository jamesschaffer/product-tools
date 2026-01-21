import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys
export const queryKeys = {
  all: ['roadmap'] as const,
  goals: () => [...queryKeys.all, 'goals'] as const,
  initiatives: () => [...queryKeys.all, 'initiatives'] as const,
  deliverables: () => [...queryKeys.all, 'deliverables'] as const,
};
