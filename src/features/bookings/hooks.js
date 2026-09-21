import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { bookingsApi } from './api';
import { useToast } from '../../components/ui/toast';
import { ApiError } from '../../lib/api';

export const bookingKeys = {
  list: (filters) => ['bookings', 'list', filters],
};

export function useBookings(filters) {
  return useQuery({ queryKey: bookingKeys.list(filters), queryFn: () => bookingsApi.list(filters), placeholderData: keepPreviousData });
}

function invalidateBookingRelated(qc) {
  qc.invalidateQueries({ queryKey: ['bookings'] });
  qc.invalidateQueries({ queryKey: ['units'] });
  qc.invalidateQueries({ queryKey: ['projects'] });
  qc.invalidateQueries({ queryKey: ['leads'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
}

/**
 * Deliberately does NOT show a generic error toast on UNIT_ALREADY_BOOKED —
 * the booking wizard renders that specific conflict inline instead, since
 * it's the one error in the whole app worth a dedicated UI treatment.
 */
export function useCreateBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: () => {
      invalidateBookingRelated(qc);
      toast.success('Booking created.');
    },
    onError: (err) => {
      invalidateBookingRelated(qc); // refresh unit availability so the taken unit greys out
      if (!(err instanceof ApiError && err.code === 'UNIT_ALREADY_BOOKED')) {
        toast.error(err.message);
      }
    },
  });
}

export function useConfirmBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: bookingsApi.confirm,
    onSuccess: () => { invalidateBookingRelated(qc); toast.success('Booking confirmed.'); },
    onError: (err) => toast.error(err.message),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingsApi.cancel(id, reason),
    onSuccess: () => { invalidateBookingRelated(qc); toast.success('Booking cancelled. The unit is available again.'); },
    onError: (err) => toast.error(err.message),
  });
}
