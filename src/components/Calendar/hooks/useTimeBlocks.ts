
import { useState, useEffect } from 'react';
import { Professional } from '@/types';

interface TimeBlock {
  id: string;
  professional_id: string;
  start_time: string;
  end_time: string;
  type: 'break' | 'unavailable';
}

export function useTimeBlocks(professionals: Professional[], selectedDate: Date) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    // Generate time blocks based on professional break times and unavailable periods
    const blocks: TimeBlock[] = [];
    
    professionals.forEach(professional => {
      // Parse break times safely
      let breakTimes: { start: string; end: string; }[] = [];
      
      if (Array.isArray(professional.break_times)) {
        breakTimes = professional.break_times;
      } else if (typeof professional.break_times === 'string') {
        try {
          breakTimes = JSON.parse(professional.break_times);
        } catch (error) {
          console.warn('Failed to parse break_times:', error);
          breakTimes = [];
        }
      }

      // Add break time blocks
      breakTimes.forEach((breakTime, index) => {
        if (breakTime.start && breakTime.end) {
          const startDate = new Date(selectedDate);
          const [startHour, startMinute] = breakTime.start.split(':');
          startDate.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
          
          const endDate = new Date(selectedDate);
          const [endHour, endMinute] = breakTime.end.split(':');
          endDate.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

          blocks.push({
            id: `break-${professional.id}-${index}`,
            professional_id: professional.id,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            type: 'break'
          });
        }
      });
    });
    
    setTimeBlocks(blocks);
  }, [professionals, selectedDate]);

  return { timeBlocks };
}
