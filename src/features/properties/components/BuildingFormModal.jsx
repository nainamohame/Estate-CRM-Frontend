import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { FormField } from '../../../components/patterns/FormField';
import { useForm } from '../../../hooks/useForm';
import { required, compose } from '../../../lib/validation';
import { useCreateBuilding } from '../hooks';

export function BuildingFormModal({ open, onClose, projectId }) {
  const createBuilding = useCreateBuilding();
  const form = useForm({
    initialValues: { name: '', totalFloors: '' },
    validators: { name: compose(required('Building name is required')) },
    onSubmit: async (values) => {
      await createBuilding.mutateAsync({ projectId, name: values.name, totalFloors: values.totalFloors ? Number(values.totalFloors) : undefined });
      form.reset();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add building"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit} loading={createBuilding.isPending}>Add building</Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <FormField label="Name" htmlFor="name" required error={form.touched.name && form.errors.name}>
          <Input id="name" placeholder="e.g. Tower A" {...form.fieldProps('name')} invalid={Boolean(form.touched.name && form.errors.name)} />
        </FormField>
        <FormField label="Total floors" htmlFor="totalFloors">
          <Input id="totalFloors" type="number" min="1" {...form.fieldProps('totalFloors')} />
        </FormField>
      </form>
    </Modal>
  );
}
