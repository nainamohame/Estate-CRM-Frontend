import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Alert } from '../../../components/ui/alert';
import { FormField } from '../../../components/patterns/FormField';
import { useForm } from '../../../hooks/useForm';
import { required, email as emailValidator, minLength, compose } from '../../../lib/validation';
import { useCreateTeamMember } from '../hooks';

export function TeamMemberFormModal({ open, onClose }) {
  const createMember = useCreateTeamMember();
  const form = useForm({
    initialValues: { fullName: '', email: '', phone: '', password: '', role: 'sales' },
    validators: {
      fullName: compose(required('Name is required')),
      email: compose(required('Email is required'), emailValidator()),
      password: compose(required('Password is required'), minLength(8, 'Must be at least 8 characters')),
    },
    onSubmit: async (values) => {
      await createMember.mutateAsync(values);
      form.reset();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add team member"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit} loading={createMember.isPending}>Add member</Button>
        </>
      }
    >
      {form.submitError && <Alert variant="danger" description={form.submitError} className="mb-4" />}
      <form onSubmit={form.handleSubmit} className="space-y-4">
        <FormField label="Full name" htmlFor="fullName" required error={form.touched.fullName && form.errors.fullName}>
          <Input id="fullName" {...form.fieldProps('fullName')} invalid={Boolean(form.touched.fullName && form.errors.fullName)} />
        </FormField>
        <FormField label="Email" htmlFor="email" required error={form.touched.email && form.errors.email}>
          <Input id="email" type="email" {...form.fieldProps('email')} invalid={Boolean(form.touched.email && form.errors.email)} />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" {...form.fieldProps('phone')} />
        </FormField>
        <FormField label="Temporary password" htmlFor="password" required error={form.touched.password && form.errors.password} hint="At least 8 characters">
          <Input id="password" type="password" {...form.fieldProps('password')} invalid={Boolean(form.touched.password && form.errors.password)} />
        </FormField>
        <FormField label="Role" htmlFor="role">
          <Select id="role" value={form.values.role} onChange={form.handleChange('role')}>
            <option value="sales">Sales Employee</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
      </form>
    </Modal>
  );
}
