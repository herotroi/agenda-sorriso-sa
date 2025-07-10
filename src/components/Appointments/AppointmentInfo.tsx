
import { Clock } from 'lucide-react';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  patients: { full_name: string };
  procedures: { name: string } | null;
}

interface AppointmentInfoProps {
  appointment: Appointment;
}

export function AppointmentInfo({ appointment }: AppointmentInfoProps) {
  return (
    <div className="space-y-3">
      <div>
        <span className="font-medium">Procedimento:</span>
        <p className="text-gray-600">{appointment.procedures?.name || 'Não especificado'}</p>
      </div>

      <div>
        <span className="font-medium">Data e Horário:</span>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(appointment.start_time).toLocaleDateString('pt-BR')} às{' '}
            {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} -{' '}
            {new Date(appointment.end_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      {appointment.notes && (
        <div>
          <span className="font-medium">Observações:</span>
          <p className="text-gray-600">{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}
