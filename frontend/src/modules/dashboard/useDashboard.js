import { useQuery } from '@tanstack/react-query';
import * as api from './dashboard.api.js';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getStats,
    refetchInterval: 30000,
  });
};
