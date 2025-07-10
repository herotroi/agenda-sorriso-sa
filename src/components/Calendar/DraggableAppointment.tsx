
import { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  status: string;
  patients?: { full_name: string };
  procedures?: { name: string } | null;
  appointment_statuses?: { label: string; color: string };
}

interface DraggableAppointmentProps {
  appointment: Appointment;
  professionalColor: string;
  position: { top: string; height: string };
  onClick: () => void;
}

export function DraggableAppointment({ 
  appointment, 
  professionalColor, 
  position, 
  onClick 
}: DraggableAppointmentProps) {
  const { handleDragStart, handleDragEnd } = useDragAndDrop();
  const [isDragStarted, setIsDragStarted] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return '#10b981';
      case 'Cancelado': return '#ef4444';
      case 'Não Compareceu': return '#6b7280';
      case 'Em atendimento': return '#3b82f6';
      case 'Finalizado': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appointment.id);
    handleDragStart(appointment);
    setIsDragStarted(true);
  };

  const onDragEnd = () => {
    handleDragEnd();
    setIsDragStarted(false);
  };

  const statusColor = appointment.appointment_statuses?.color || getStatusColor(appointment.status);
  const statusLabel = appointment.appointment_statuses?.label || appointment.status;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`absolute left-1 right-1 rounded p-2 text-xs text-white cursor-move hover:opacity-80 transition-opacity ${
        isDragStarted ? 'opacity-50' : ''
      }`}
      style={{
        ...position,
        backgroundColor: professionalColor,
        minHeight: '40px',
        borderLeft: `4px solid ${statusColor}`
      }}
    >
      <div className="font-medium truncate">
        {appointment.patients?.full_name}
      </div>
      <div className="truncate opacity-90">
        {appointment.procedures?.name}
      </div>
      <div className="text-xs opacity-75">
        {new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
      <div className="text-xs font-semibold">
        {statusLabel}
      </div>
    </div>
  );
}
