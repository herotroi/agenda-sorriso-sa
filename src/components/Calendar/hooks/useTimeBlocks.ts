
import { useState, useEffect } from 'react';
import { Professional } from '@/types';
import { generateTimeBlocks } from './utils/timeBlockUtils';

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
    const blocks = generateTimeBlocks(professionals, selectedDate);
    setTimeBlocks(blocks);
  }, [professionals, selectedDate]);

  return { timeBlocks };
}
