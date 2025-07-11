
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

export const generateTimeBlocks = (professionals: Professional[], selectedDate: Date): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  const dateStr = selectedDate.toISOString().split('T')[0];

  professionals.forEach(prof => {
    // Gerar blocos de folga (break times)
    if (prof.break_times && Array.isArray(prof.break_times)) {
      prof.break_times.forEach((breakTime, index) => {
        blocks.push({
          id: `break-${prof.id}-${index}`,
          type: 'break',
          professional_id: prof.id,
          start_time: `${dateStr}T${breakTime.start}:00`,
          end_time: `${dateStr}T${breakTime.end}:00`,
          title: 'Intervalo'
        });
      });
    }

    // Gerar blocos de férias
    if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
      const vacationStart = new Date(prof.vacation_start);
      const vacationEnd = new Date(prof.vacation_end);
      
      if (selectedDate >= vacationStart && selectedDate <= vacationEnd) {
        blocks.push({
          id: `vacation-${prof.id}`,
          type: 'vacation',
          professional_id: prof.id,
          start_time: `${dateStr}T00:00:00`,
          end_time: `${dateStr}T23:59:59`,
          title: 'Férias'
        });
      }
    }
  });

  return blocks;
};
