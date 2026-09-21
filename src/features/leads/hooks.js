import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { leadsApi } from './api';
import { useToast } from '../../components/ui/toast';

export const leadKeys = {
  all: ['leads'],
  list: (filters) => ['leads', 'list', filters],
  board: (filters) => ['leads', 'board', filters],
  detail: (id) => ['leads', 'detail', id],
  activities: (id) => ['leads', id, 'activities'],
  followUps: (id) => ['leads', id, 'follow-ups'],
};

export function useLeads(filters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => leadsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLeadsBoard(filters) {
  return useQuery({
    queryKey: leadKeys.board(filters),
    queryFn: () => leadsApi.board(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useLeadActivities(id) {
  return useQuery({
    queryKey: leadKeys.activities(id),
    queryFn: () => leadsApi.activities(id),
    enabled: Boolean(id),
  });
}

export function useLeadFollowUps(id) {
  return useQuery({
    queryKey: leadKeys.followUps(id),
    queryFn: () => leadsApi.followUps(id),
    enabled: Boolean(id),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Lead created.');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateLead(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => leadsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
      toast.success('Lead updated.');
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useChangeLeadStage(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => leadsApi.changeStage(id, body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: leadKeys.detail(id) });
      const previous = qc.getQueryData(leadKeys.detail(id));
      if (previous) qc.setQueryData(leadKeys.detail(id), { ...previous, stage: body.stage });
      return { previous };
    },
    onError: (err, _body, context) => {
      if (context?.previous) qc.setQueryData(leadKeys.detail(id), context.previous);
      toast.error(err.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: leadKeys.activities(id) });
      qc.invalidateQueries({ queryKey: leadKeys.followUps(id) });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: leadKeys.detail(id) }),
  });
}

export function useAddActivity(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => leadsApi.addActivity(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.activities(id) });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
    },
    onError: (err) => toast.error(err.message),
  });
}

export function useCreateFollowUp(id) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => leadsApi.createFollowUp(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leadKeys.followUps(id) });
      qc.invalidateQueries({ queryKey: leadKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      toast.success('Follow-up scheduled.');
    },
    onError: (err) => toast.error(err.message),
  });
}
