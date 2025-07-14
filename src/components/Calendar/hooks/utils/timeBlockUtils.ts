
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

    // Gerar blocos de férias com correção precisa de datas
    if (prof.vacation_active && prof.vacation_start && prof.vacation_end) {
      // Normalizar a data atual para comparação (apenas ano, mês e dia)
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      // Criar datas de início e fim das férias normalizadas
      const vacationStartParts = prof.vacation_start.split('-');
      const vacationEndParts = prof.vacation_end.split('-');
      
      const vacationStartDay = new Date(
        parseInt(vacationStartParts[0]), 
        parseInt(vacationStartParts[1]) - 1, 
        parseInt(vacationStartParts[2])
      );
      
      const vacationEndDay = new Date(
        parseInt(vacationEndParts[0]), 
        parseInt(vacationEndParts[1]) - 1, 
        parseInt(vacationEndParts[2])
      );
      
      console.log(`Checking vacation for ${prof.name}:`, {
        vacationStartOriginal: prof.vacation_start,
        vacationEndOriginal: prof.vacation_end,
        vacationStartDay: vacationStartDay.toDateString(),
        vacationEndDay: vacationEndDay.toDateString(),
        currentDate: currentDate.toDateString(),
        selectedDate: selectedDate.toDateString(),
        isInVacation: currentDate >= vacationStartDay && currentDate <= vacationEndDay,
        comparison: {
          currentTime: currentDate.getTime(),
          startTime: vacationStartDay.getTime(),
          endTime: vacationEndDay.getTime()
        }
      });
      
      // Verificar se a data atual está dentro do período de férias (inclusive apenas até o último dia)
      if (currentDate >= vacationStartDay && currentDate <= vacationEndDay) {
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
