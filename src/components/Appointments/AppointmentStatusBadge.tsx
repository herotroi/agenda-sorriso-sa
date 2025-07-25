
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentStatusBadgeProps {
  statusId?: number;
  status?: string;
  statusColor?: string;
  isBlocked?: boolean;
}

interface StatusOption {
  id: number;
  key: string;
  label: string;
  color: string;
}

export function AppointmentStatusBadge({ statusId, status, statusColor, isBlocked }: AppointmentStatusBadgeProps) {
  const [statusData, setStatusData] = useState<StatusOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatusData = async () => {
      if (statusId) {
        try {
          const { data, error } = await supabase
            .from('appointment_statuses')
            .select('*')
            .eq('id', statusId)
            .single();

          if (error) throw error;
          setStatusData(data);
        } catch (error) {
          console.error('Erro ao carregar status:', error);
        }
      }
      setLoading(false);
    };

    fetchStatusData();
  }, [statusId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmado': return '#10b981';
      case 'Cancelado': return '#ef4444';
      case 'Não Compareceu': return '#6b7280';
      case 'Em atendimento': return '#3b82f6';
      case 'Finalizado': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Badge className="text-white bg-gray-400">
        Carregando...
      </Badge>
    );
  }

  // Para agendamentos bloqueados, sempre mostrar o status de bloqueio
  if (isBlocked) {
    return (
      <Badge 
        className="text-white"
        style={{ backgroundColor: '#9ca3af' }}
      >
        Horário Bloqueado
      </Badge>
    );
  }

  const displayLabel = statusData?.label || status || 'Status não definido';
  const backgroundColor = statusColor || statusData?.color || getStatusColor(status || '');

  return (
    <Badge 
      className="text-white"
      style={{ backgroundColor }}
    >
      {displayLabel}
    </Badge>
  );
}
