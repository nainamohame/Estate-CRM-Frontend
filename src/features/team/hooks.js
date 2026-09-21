import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teamApi } from './api';
import { useToast } from '../../components/ui/toast';

export function useTeam() {
  return useQuery({ queryKey: ['team'], queryFn: teamApi.list });
}

export function useAssignableUsers() {
  return useQuery({ queryKey: ['team', 'assignable'], queryFn: teamApi.assignable, staleTime: 5 * 60 * 1000 });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: teamApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Team member added.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, body }) => teamApi.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Team member updated.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useSetTeamMemberActive() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, isActive }) => teamApi.setActive(id, isActive),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['team'] });
      toast.success(vars.isActive ? 'Account activated.' : 'Account deactivated.');
    },
    onError: (err) => toast.error(err.message),
  });
}
