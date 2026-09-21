import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { propertiesApi } from './api';
import { useToast } from '../../components/ui/toast';

export const propertyKeys = {
  projects: ['projects'],
  project: (id) => ['projects', id],
  units: (filters) => ['units', filters],
  unit: (id) => ['units', 'detail', id],
};

export function useProjects() {
  return useQuery({ queryKey: propertyKeys.projects, queryFn: propertiesApi.listProjects });
}

export function useProject(id) {
  return useQuery({ queryKey: propertyKeys.project(id), queryFn: () => propertiesApi.getProject(id), enabled: Boolean(id) });
}

export function useUnits(filters) {
  return useQuery({ queryKey: propertyKeys.units(filters), queryFn: () => propertiesApi.listUnits(filters), placeholderData: keepPreviousData });
}

export function useUnit(id) {
  return useQuery({ queryKey: propertyKeys.unit(id), queryFn: () => propertiesApi.getUnit(id), enabled: Boolean(id) });
}

function useInvalidateInventory() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['projects'] });
    qc.invalidateQueries({ queryKey: ['units'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
}

export function useCreateProject() {
  const invalidate = useInvalidateInventory();
  const toast = useToast();
  return useMutation({
    mutationFn: propertiesApi.createProject,
    onSuccess: () => { invalidate(); toast.success('Project created.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useUpdateProject(id) {
  const qc = useQueryClient();
  const invalidate = useInvalidateInventory();
  const toast = useToast();
  return useMutation({
    mutationFn: (body) => propertiesApi.updateProject(id, body),
    onSuccess: () => { invalidate(); qc.invalidateQueries({ queryKey: propertyKeys.project(id) }); toast.success('Project updated.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useCreateBuilding() {
  const invalidate = useInvalidateInventory();
  const toast = useToast();
  return useMutation({
    mutationFn: propertiesApi.createBuilding,
    onSuccess: () => { invalidate(); toast.success('Building added.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useCreateUnit() {
  const invalidate = useInvalidateInventory();
  const toast = useToast();
  return useMutation({
    mutationFn: propertiesApi.createUnit,
    onSuccess: () => { invalidate(); toast.success('Unit added.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useSetListingStatus() {
  const invalidate = useInvalidateInventory();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, listingStatus }) => propertiesApi.setListingStatus(id, listingStatus),
    onSuccess: () => { invalidate(); toast.success('Unit updated.'); },
    onError: (err) => toast.error(err.message),
  });
}
