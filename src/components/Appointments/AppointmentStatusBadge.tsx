
import { Badge } from '@/components/ui/badge';

interface AppointmentStatusBadgeProps {
  status: string;
  statusColor?: string;
}

export function AppointmentStatusBadge({ status, statusColor }: AppointmentStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-500';
      case 'Cancelado': return 'bg-red-500';
      case 'Não Compareceu': return 'bg-gray-500';
      case 'Em atendimento': return 'bg-blue-500';
      case 'Finalizado': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const backgroundColor = statusColor || getStatusColor(status);

  return (
    <Badge 
      className="text-white"
      style={{ backgroundColor }}
    >
      {status}
    </Badge>
  );
}
