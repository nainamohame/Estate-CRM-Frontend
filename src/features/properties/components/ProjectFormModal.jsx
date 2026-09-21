import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Alert } from '../../../components/ui/alert';
import { FormField } from '../../../components/patterns/FormField';
import { useForm } from '../../../hooks/useForm';
import { required, compose } from '../../../lib/validation';
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from '../../../lib/constants';
import { useCreateProject } from '../hooks';

export function ProjectFormModal({ open, onClose }) {
  const createProject = useCreateProject();
  const form = useForm({
    initialValues: { name: '', city: '', locality: '', status: 'under_construction', possessionDate: '', reraNumber: '', description: '' },
    validators: { name: compose(required('Project name is required')), city: compose(required('City is required')) },
    onSubmit: async (values) => {
      await createProject.mutateAsync(values);
      form.reset();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit} loading={createProject.isPending}>Create project</Button>
        </>
      }
    >
      {form.submitError && <Alert variant="danger" description={form.submitError} className="mb-4" />}
      <form onSubmit={form.handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Project name" htmlFor="name" required error={form.touched.name && form.errors.name}>
          <Input id="name" {...form.fieldProps('name')} invalid={Boolean(form.touched.name && form.errors.name)} />
        </FormField>
        <FormField label="City" htmlFor="city" required error={form.touched.city && form.errors.city}>
          <Input id="city" {...form.fieldProps('city')} invalid={Boolean(form.touched.city && form.errors.city)} />
        </FormField>
        <FormField label="Locality" htmlFor="locality">
          <Input id="locality" {...form.fieldProps('locality')} />
        </FormField>
        <FormField label="Status" htmlFor="status">
          <Select id="status" value={form.values.status} onChange={form.handleChange('status')}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Possession date" htmlFor="possessionDate">
          <Input id="possessionDate" type="date" {...form.fieldProps('possessionDate')} />
        </FormField>
        <FormField label="RERA number" htmlFor="reraNumber">
          <Input id="reraNumber" {...form.fieldProps('reraNumber')} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" rows={3} {...form.fieldProps('description')} />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
