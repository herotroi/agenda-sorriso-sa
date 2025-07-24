
import { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DraggableAppointmentProps {
  appointment: {
    id: string;
    patient_id: string | null;
    professional_id: string;
    start_time: string;
    end_time: string;
    status: string;
    is_blocked?: boolean;
    patients?: { full_name: string } | null;
    procedures?: { name: string } | null;
    appointment_statuses?: { label: string; color: string } | null;
  };
  professionalColor?: string;
  position: {
    top: string;
    height: string;
  };
  onClick: () => void;
}

export function DraggableAppointment({ 
  appointment, 
  professionalColor = '#3b82f6',
  position,
  onClick 
}: DraggableAppointmentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { startDrag } = useDragAndDrop();
  const isBlocked = appointment.is_blocked;

  const onDragStart = (e: React.DragEvent) => {
    if (isBlocked) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    startDrag(appointment);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const startTime = new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const endTime = new Date(appointment.end_time).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const displayName = isBlocked ? 'Horário Bloqueado' : (appointment.patients?.full_name || 'Sem paciente');
  const displayProcedure = isBlocked ? '' : (appointment.procedures?.name || '');

  return (
    <div
      draggable={!isBlocked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`absolute left-1 right-1 rounded-md p-2 text-white text-xs shadow-sm transition-all duration-200 ${
        isBlocked 
          ? 'bg-gray-400 cursor-not-allowed opacity-75' 
          : 'cursor-move hover:shadow-md'
      } ${isDragging ? 'opacity-50 scale-95' : ''}`}
      style={{
        top: position.top,
        height: position.height,
        backgroundColor: isBlocked ? '#9ca3af' : professionalColor,
        minHeight: '32px'
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="font-medium text-xs leading-tight truncate">
          {displayName}
        </div>
        
        {displayProcedure && (
          <div className="text-xs opacity-90 truncate">
            {displayProcedure}
          </div>
        )}
        
        <div className="text-xs opacity-80 font-mono">
          {startTime} - {endTime}
        </div>
        
        {appointment.appointment_statuses?.label && !isBlocked && (
          <div className="text-xs opacity-75">
            {appointment.appointment_statuses.label}
          </div>
        )}
      </div>
    </div>
  );
}
