import { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { FormField } from './FormField';

/**
 * Reused for every destructive/irreversible action in the app: cancel
 * booking, deactivate user, delete lead. `requireReason` turns on a
 * mandatory text field — used directly for the booking cancellation reason.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'default',
  loading = false,
  requireReason = false,
  reasonLabel = 'Reason',
}) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const reasonInvalid = requireReason && touched && reason.trim().length < 3;

  const handleConfirm = () => {
    if (requireReason) {
      setTouched(true);
      if (reason.trim().length < 3) return;
      onConfirm(reason.trim());
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={!requireReason ? description : undefined}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {requireReason && (
        <FormField label={reasonLabel} required error={reasonInvalid ? 'Please give a reason (at least 3 characters)' : undefined}>
          <Textarea
            autoFocus
            rows={3}
            value={reason}
            invalid={reasonInvalid}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={description}
          />
        </FormField>
      )}
    </Modal>
  );
}
