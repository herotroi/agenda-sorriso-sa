
interface TimeBlock {
  id: string;
  type: 'break' | 'vacation';
  professional_id: string;
  start_time: string;
  end_time: string;
  title: string;
}

interface TimeBlockProps {
  timeBlock: TimeBlock;
  position: { top: string; height: string };
}

export function TimeBlock({ timeBlock, position }: TimeBlockProps) {
  const getBlockColor = (type: string) => {
    switch (type) {
      case 'break':
        return '#fed7d7'; // vermelho claro para intervalos
      case 'vacation':
        return '#fbb6ce'; // rosa claro para férias
      default:
        return '#fed7d7';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'break':
        return '#f56565'; // vermelho para intervalos
      case 'vacation':
        return '#ed64a6'; // rosa para férias
      default:
        return '#f56565';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'break':
        return '☕';
      case 'vacation':
        return '🏖️';
      default:
        return '⏰';
    }
  };

  const startTime = new Date(timeBlock.start_time);
  const endTime = new Date(timeBlock.end_time);
  
  const timeRange = timeBlock.type === 'vacation' 
    ? 'Dia inteiro'
    : `${startTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${endTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;

  return (
    <div
      className="absolute left-1 right-1 rounded-md p-2 text-xs border-l-4 overflow-hidden z-10 pointer-events-auto"
      style={{
        ...position,
        backgroundColor: getBlockColor(timeBlock.type),
        borderLeftColor: getBorderColor(timeBlock.type),
        minHeight: '32px',
        color: '#2d3748'
      }}
    >
      <div className="space-y-1">
        <div className="font-semibold truncate text-xs flex items-center gap-1">
          <span>{getIcon(timeBlock.type)}</span>
          {timeBlock.title}
        </div>
        <div className="text-xs opacity-75">
          {timeRange}
        </div>
      </div>
    </div>
  );
}
