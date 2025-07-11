
import { useProfessionals } from './useProfessionals';
import { useAppointments } from './useAppointments';
import { useTimeBlocks } from './useTimeBlocks';
import { checkTimeConflicts } from './utils/appointmentUtils';

export function useCalendarData(selectedDate: Date) {
  const { professionals, loading: professionalsLoading } = useProfessionals();
  const { appointments, loading: appointmentsLoading, refreshAppointments } = useAppointments(selectedDate);
  const { timeBlocks } = useTimeBlocks(professionals, selectedDate);

  const loading = professionalsLoading || appointmentsLoading;

  return {
    professionals,
    appointments,
    timeBlocks,
    loading,
    refreshAppointments,
    checkTimeConflicts
  };
}
