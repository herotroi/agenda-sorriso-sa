
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

    // Gerar blocos de férias com correção de fuso horário
    if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
      // Parsing correto das datas para evitar problemas de fuso horário
      const vacationStartParts = prof.vacation_start.split('-');
      const vacationEndParts = prof.vacation_end.split('-');
      
      const vacationStart = new Date(
        parseInt(vacationStartParts[0]), 
        parseInt(vacationStartParts[1]) - 1, // mês começa em 0
        parseInt(vacationStartParts[2])
      );
      
      const vacationEnd = new Date(
        parseInt(vacationEndParts[0]), 
        parseInt(vacationEndParts[1]) - 1, // mês começa em 0
        parseInt(vacationEndParts[2])
      );
      
      // Data atual sem horário para comparação precisa
      const currentDate = new Date(
        selectedDate.getFullYear(), 
        selectedDate.getMonth(), 
        selectedDate.getDate()
      );
      
      console.log(`Checking vacation for ${prof.name}:`, {
        vacationStart: vacationStart.toDateString(),
        vacationEnd: vacationEnd.toDateString(),
        currentDate: currentDate.toDateString(),
        selectedDate: selectedDate.toDateString(),
        isInVacation: currentDate >= vacationStart && currentDate <= vacationEnd,
        vacationStartOriginal: prof.vacation_start,
        vacationEndOriginal: prof.vacation_end
      });
      
      // Verificar se a data atual está dentro do período de férias (inclusive)
      if (currentDate >= vacationStart && currentDate <= vacationEnd) {
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

  console.log('Generated time blocks:', blocks);
  return blocks;
};
