
import { generateVacationBlock } from '@/utils/vacationDateUtils';
import { Professional } from '@/types';

interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

export const generateTimeBlocks = (professionals: Professional[], selectedDate: Date): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  const dateStr = selectedDate.toISOString().split('T')[0];

  professionals.forEach(prof => {
    // Gerar blocos de folga (break times) - handle array safely
    const breakTimes = prof.break_times || [];
    
    breakTimes.forEach((breakTime, index) => {
      if (breakTime && breakTime.start && breakTime.end) {
        blocks.push({
          id: `break-${prof.id}-${index}`,
          type: 'break',
          professional_id: prof.id,
          start_time: `${dateStr}T${breakTime.start}:00`,
          end_time: `${dateStr}T${breakTime.end}:00`,
          title: 'Intervalo'
        });
      }
    });

    // Gerar blocos de férias usando utilitário centralizado
    const vacationBlock = generateVacationBlock(prof, selectedDate);
    if (vacationBlock) {
      blocks.push(vacationBlock);
    }
  });

  console.log('Generated time blocks:', blocks);
  return blocks;
};
