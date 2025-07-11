
import { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const getLighterColor = (color: string, opacity: number = 0.15) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
  const lighterBgColor = getLighterColor(professionalColor, 0.15);

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const timeRange = `${startTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${endTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-semibold">{appointment.patients?.full_name}</div>
      <div className="text-sm">{appointment.procedures?.name || 'Sem procedimento'}</div>
      <div className="text-sm">{timeRange}</div>
      <div className="text-sm">Status: {statusLabel}</div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onClick}
            className={`absolute left-1 right-1 rounded-md p-2 text-xs cursor-move hover:opacity-90 transition-all shadow-sm border-l-4 overflow-hidden ${
              isDragStarted ? 'opacity-50 z-50' : 'z-10'
            }`}
            style={{
              ...position,
              backgroundColor: lighterBgColor,
              borderLeftColor: statusColor,
              minHeight: '32px',
              color: '#1f2937'
            }}
          >
            <div className="space-y-1">
              <div className="font-semibold truncate text-gray-800 text-xs">
                {appointment.patients?.full_name}
              </div>
              <div className="truncate text-gray-700 text-xs">
                {appointment.procedures?.name}
              </div>
              <div className="text-xs text-gray-600">
                {startTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="flex justify-start">
                <div 
                  className="text-xs font-bold px-1.5 py-0.5 rounded text-white truncate max-w-full"
                  style={{ backgroundColor: statusColor }}
                >
                  {statusLabel}
                </div>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
