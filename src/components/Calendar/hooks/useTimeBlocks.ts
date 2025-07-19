
import { useState, useEffect } from 'react';
import { generateTimeBlocks } from './utils/timeBlockUtils';
import type { Professional } from '@/types';

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
