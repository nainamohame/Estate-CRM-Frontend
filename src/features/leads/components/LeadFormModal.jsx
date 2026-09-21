import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Alert } from '../../../components/ui/alert';
import { FormField } from '../../../components/patterns/FormField';
import { useForm } from '../../../hooks/useForm';
import { required, phone as phoneValidator, email as emailValidator, compose } from '../../../lib/validation';
import { LEAD_SOURCES, SOURCE_LABELS, UNIT_TYPES, UNIT_TYPE_LABELS } from '../../../lib/constants';
import { useProjects } from '../../properties/hooks';
import { useAssignableUsers } from '../../team/hooks';
import { useAuth } from '../../auth/useAuth';
import { useCreateLead, useUpdateLead } from '../hooks';

export function LeadFormModal({ open, onClose, lead }) {
  const isEdit = Boolean(lead);
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const { data: assignable } = useAssignableUsers();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead(lead?.id);

  const form = useForm({
    initialValues: {
      fullName: lead?.fullName ?? '',
      phone: lead?.phone ?? '',
      email: lead?.email ?? '',
      source: lead?.source ?? 'website',
      budgetMin: lead?.budgetMin ?? '',
      budgetMax: lead?.budgetMax ?? '',
      preferredUnitType: lead?.preferredUnitType ?? '',
      interestedProjectId: lead?.interestedProjectId ?? '',
      assignedTo: lead?.assignedTo ?? (user?.role === 'sales' ? user.id : ''),
      requirement: lead?.requirement ?? '',
    },
    validators: {
      fullName: compose(required('Name is required')),
      phone: compose(required('Phone number is required'), phoneValidator()),
      email: emailValidator(),
    },
    onSubmit: async (values) => {
      const payload = {
        ...values,
        budgetMin: values.budgetMin === '' ? undefined : Number(values.budgetMin),
        budgetMax: values.budgetMax === '' ? undefined : Number(values.budgetMax),
      };
      if (isEdit) {
        await updateLead.mutateAsync(payload);
      } else {
        await createLead.mutateAsync(payload);
      }
      onClose();
    },
  });

  const isSubmitting = createLead.isPending || updateLead.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit lead' : 'New lead'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit} loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create lead'}
          </Button>
        </>
      }
    >
      {form.submitError && <Alert variant="danger" description={form.submitError} className="mb-4" />}

      <form onSubmit={form.handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Full name" htmlFor="fullName" required error={form.touched.fullName && form.errors.fullName}>
          <Input id="fullName" {...form.fieldProps('fullName')} invalid={Boolean(form.touched.fullName && form.errors.fullName)} />
        </FormField>
        <FormField label="Phone" htmlFor="phone" required error={form.touched.phone && form.errors.phone}>
          <Input id="phone" {...form.fieldProps('phone')} invalid={Boolean(form.touched.phone && form.errors.phone)} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={form.touched.email && form.errors.email}>
          <Input id="email" type="email" {...form.fieldProps('email')} invalid={Boolean(form.touched.email && form.errors.email)} />
        </FormField>
        <FormField label="Source" htmlFor="source">
          <Select id="source" value={form.values.source} onChange={form.handleChange('source')}>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Budget min" htmlFor="budgetMin">
          <Input id="budgetMin" type="number" prefix="₹" min="0" {...form.fieldProps('budgetMin')} />
        </FormField>
        <FormField label="Budget max" htmlFor="budgetMax" error={form.touched.budgetMax && form.errors.budgetMax}>
          <Input id="budgetMax" type="number" prefix="₹" min="0" {...form.fieldProps('budgetMax')} />
        </FormField>
        <FormField label="Preferred unit type" htmlFor="preferredUnitType">
          <Select id="preferredUnitType" placeholder="Any" value={form.values.preferredUnitType} onChange={form.handleChange('preferredUnitType')}>
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {UNIT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Interested project" htmlFor="interestedProjectId">
          <Select id="interestedProjectId" placeholder="None" value={form.values.interestedProjectId} onChange={form.handleChange('interestedProjectId')}>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        {user?.role === 'admin' && (
          <FormField label="Assign to" htmlFor="assignedTo">
            <Select id="assignedTo" placeholder="Unassigned" value={form.values.assignedTo} onChange={form.handleChange('assignedTo')}>
              {assignable?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <div className="sm:col-span-2">
          <FormField label="Requirement notes" htmlFor="requirement">
            <Textarea id="requirement" rows={3} maxLength={2000} {...form.fieldProps('requirement')} />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
