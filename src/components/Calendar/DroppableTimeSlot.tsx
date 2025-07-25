
import { useState } from 'react';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DroppableTimeSlotProps {
  hour: number;
  professionalId: string;
  date: Date;
  hasAppointment: boolean;
  children?: React.ReactNode;
}

export function DroppableTimeSlot({ 
  hour, 
  professionalId, 
  date, 
  hasAppointment,
  children 
}: DroppableTimeSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { handleDrop, isDragging } = useDragAndDrop();

  const onDragOver = (e: React.DragEvent) => {
    if (hasAppointment || !isDragging) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (hasAppointment) return;

    const dropTime = new Date(date);
    dropTime.setHours(hour, 0, 0, 0);
    
    handleDrop(dropTime.toISOString(), professionalId);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`h-20 border-b border-gray-100 transition-colors relative ${
        isDragOver && !hasAppointment 
          ? 'bg-green-100 border-green-300' 
          : hasAppointment 
          ? 'bg-gray-50' 
          : 'hover:bg-gray-50'
      } ${hasAppointment ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
      {isDragOver && !hasAppointment && (
        <div className="flex items-center justify-center h-full text-xs text-green-600 font-medium">
          Soltar aqui
        </div>
      )}
      
      {/* Linha de grade sutil para cada 30 minutos */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-50"></div>
    </div>
  );
}
