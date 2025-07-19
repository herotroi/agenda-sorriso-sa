
import { useState, useEffect } from 'react';
import { generateTimeBlocks } from './utils/timeBlockUtils';

interface Professional {
  id: string;
  name: string;
  color: string;
  break_times?: Array<{ start: string; end: string }>;
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
  working_days?: boolean[];
}

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

export function useTimeBlocks(professionals: Professional[], selectedDate: Date) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    if (professionals.length > 0) {
      const blocks = generateTimeBlocks(professionals, selectedDate);
      setTimeBlocks(blocks);
    }
  }, [professionals, selectedDate]);

  return {
    timeBlocks
  };
}
