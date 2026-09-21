import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followUpsApi } from './api';
import { useToast } from '../../components/ui/toast';

export function useFollowUps(filters) {
  return useQuery({ queryKey: ['follow-ups', filters], queryFn: () => followUpsApi.list(filters) });
}

export function useUpdateFollowUp() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }) => followUpsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Follow-up updated.');
    },
    onError: (err) => toast.error(err.message),
  });
}
