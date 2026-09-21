import { Modal } from '../../../components/ui/modal';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { FormField } from '../../../components/patterns/FormField';
import { useForm } from '../../../hooks/useForm';
import { required, compose, min } from '../../../lib/validation';
import { UNIT_TYPES, UNIT_TYPE_LABELS } from '../../../lib/constants';
import { useCreateUnit } from '../hooks';

export function UnitFormModal({ open, onClose, buildingId, buildings = [] }) {
  const createUnit = useCreateUnit();
  const form = useForm({
    initialValues: { buildingId: buildingId ?? buildings[0]?.id ?? '', unitNumber: '', floor: '', unitType: '2bhk', carpetAreaSqft: '', price: '', facing: '' },
    validators: {
      buildingId: compose(required('Choose a building')),
      unitNumber: compose(required('Unit number is required')),
      price: compose(required('Price is required'), min(0, 'Price cannot be negative')),
    },
    onSubmit: async (values) => {
      await createUnit.mutateAsync({
        ...values,
        floor: values.floor === '' ? undefined : Number(values.floor),
        carpetAreaSqft: values.carpetAreaSqft === '' ? undefined : Number(values.carpetAreaSqft),
        price: Number(values.price),
      });
      form.reset();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add unit"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={form.handleSubmit} loading={createUnit.isPending}>Add unit</Button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!buildingId && (
          <div className="sm:col-span-2">
            <FormField label="Building" htmlFor="buildingId" required error={form.touched.buildingId && form.errors.buildingId}>
              <Select id="buildingId" value={form.values.buildingId} onChange={form.handleChange('buildingId')}>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </Select>
            </FormField>
          </div>
        )}
        <FormField label="Unit number" htmlFor="unitNumber" required error={form.touched.unitNumber && form.errors.unitNumber}>
          <Input id="unitNumber" placeholder="e.g. A-1204" {...form.fieldProps('unitNumber')} invalid={Boolean(form.touched.unitNumber && form.errors.unitNumber)} />
        </FormField>
        <FormField label="Floor" htmlFor="floor">
          <Input id="floor" type="number" {...form.fieldProps('floor')} />
        </FormField>
        <FormField label="Unit type" htmlFor="unitType">
          <Select id="unitType" value={form.values.unitType} onChange={form.handleChange('unitType')}>
            {UNIT_TYPES.map((t) => (
              <option key={t} value={t}>{UNIT_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Carpet area" htmlFor="carpetAreaSqft">
          <Input id="carpetAreaSqft" type="number" suffix="sq.ft" {...form.fieldProps('carpetAreaSqft')} />
        </FormField>
        <FormField label="Price" htmlFor="price" required error={form.touched.price && form.errors.price}>
          <Input id="price" type="number" prefix="₹" {...form.fieldProps('price')} invalid={Boolean(form.touched.price && form.errors.price)} />
        </FormField>
        <FormField label="Facing" htmlFor="facing">
          <Input id="facing" placeholder="e.g. North-East" {...form.fieldProps('facing')} />
        </FormField>
      </form>
    </Modal>
  );
}
