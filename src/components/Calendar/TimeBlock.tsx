
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
        return '#fecaca'; // vermelho claro para intervalos
      case 'vacation':
        return '#fca5a5'; // vermelho um pouco mais escuro para férias
      default:
        return '#fecaca';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'break':
        return '#ef4444'; // vermelho para intervalos
      case 'vacation':
        return '#dc2626'; // vermelho mais escuro para férias
      default:
        return '#ef4444';
    }
  };

  const startTime = new Date(timeBlock.start_time);
  const endTime = new Date(timeBlock.end_time);
  
  const timeRange = `${startTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${endTime.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;

  return (
    <div
      className="absolute left-1 right-1 rounded-md p-2 text-xs border-l-4 overflow-hidden z-5"
      style={{
        ...position,
        backgroundColor: getBlockColor(timeBlock.type),
        borderLeftColor: getBorderColor(timeBlock.type),
        minHeight: '32px',
        color: '#7f1d1d'
      }}
    >
      <div className="space-y-1">
        <div className="font-semibold truncate text-xs">
          {timeBlock.title}
        </div>
        {timeBlock.type === 'break' && (
          <div className="text-xs">
            {timeRange}
          </div>
        )}
        {timeBlock.type === 'vacation' && (
          <div className="text-xs">
            Dia inteiro
          </div>
        )}
      </div>
    </div>
  );
}
