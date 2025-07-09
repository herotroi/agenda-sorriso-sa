
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
      case 'Confirmado': return 'bg-green-500';
      case 'Cancelado': return 'bg-red-500';
      case 'Não Compareceu': return 'bg-gray-500';
      case 'Em atendimento': return 'bg-blue-500';
      case 'Finalizado': return 'bg-purple-500';
      default: return 'bg-gray-400';
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
        border: `2px solid ${getStatusColor(appointment.status)}`
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
        {appointment.status}
      </div>
    </div>
  );
}
