
import { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DraggableAppointmentProps {
  appointment: {
    id: string;
    patient_id: string | null;
    professional_id: string;
    start_time: string;
    end_time: string;
    status_id: number;
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

  // Determinar a cor de fundo baseada no tipo de agendamento
  const getBackgroundColor = () => {
    if (isBlocked) {
      return '#9ca3af'; // Cinza mais forte para horários bloqueados
    }
    
    // Para agendamentos comuns, usar a cor do status se disponível, senão a cor do profissional
    if (appointment.appointment_statuses?.color) {
      return appointment.appointment_statuses.color;
    }
    
    return professionalColor;
  };

  const getTextColor = () => {
    if (isBlocked) {
      return '#ffffff'; // Texto branco para horários bloqueados
    }
    return '#ffffff'; // Texto branco para agendamentos normais
  };

  if (isBlocked) {
    return (
      <div
        onClick={onClick}
        className="absolute left-1 right-1 rounded-md p-2 text-xs shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md"
        style={{
          top: position.top,
          height: position.height,
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
          minHeight: '32px'
        }}
      >
        <div className="flex flex-col h-full justify-center items-center text-center">
          <div className="font-semibold text-sm mb-1">
            Horário Bloqueado
          </div>
          <div className="text-xs font-mono mb-1">
            {startTime} - {endTime}
          </div>
          <div className="text-xs opacity-90">
            Período indisponível
          </div>
        </div>
      </div>
    );
  }

  // Renderização para agendamentos normais
  const displayName = appointment.patients?.full_name || 'Sem paciente';
  const displayProcedure = appointment.procedures?.name || '';

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`absolute left-1 right-1 rounded-md p-2 text-white text-xs shadow-sm transition-all duration-200 cursor-move hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
      style={{
        top: position.top,
        height: position.height,
        backgroundColor: getBackgroundColor(),
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
        
        {appointment.appointment_statuses?.label && (
          <div className="text-xs opacity-75">
            {appointment.appointment_statuses.label}
          </div>
        )}
      </div>
    </div>
  );
}
