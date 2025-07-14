
import { Edit, Trash2, Calendar, Clock, Coffee, Plane, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/types';

interface ProfessionalCardProps {
  professional: Professional;
  onEdit: (professional: Professional) => void;
  onDelete: (professionalId: string, professionalName: string) => Promise<void>;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ProfessionalCard({ professional, onEdit, onDelete }: ProfessionalCardProps) {
  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o profissional ${professional.name}?`)) {
      await onDelete(professional.id, professional.name);
    }
  };

  const formatTime = (time: string | null | undefined) => {
    if (!time) return '--:--';
    return time;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '--';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getWorkingDays = () => {
    const workingDays = professional.working_days || [true, true, true, true, true, false, false];
    return WEEKDAYS.filter((_, index) => workingDays[index]).join(', ');
  };

  const getBreakTimes = () => {
    if (!professional.break_times || !Array.isArray(professional.break_times)) return [];
    return professional.break_times;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Header com nome, status e ações */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: professional.calendarColor || '#3b82f6' }}
                />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {professional.name}
                </h3>
                <Badge variant={professional.isActive ? 'default' : 'secondary'} className="text-xs">
                  {professional.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-1 ml-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(professional)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {professional.specialty && (
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-gray-700">Especialidade:</span>
                <span className="text-gray-600 truncate">{professional.specialty}</span>
              </div>
            )}
            {professional.cro && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">CRM/CRO:</span>
                <span className="text-gray-600">{professional.cro}</span>
              </div>
            )}
            {professional.email && (
              <div className="flex items-center gap-2 md:col-span-2">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-gray-600 truncate">{professional.email}</span>
              </div>
            )}
            {professional.phone && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Telefone:</span>
                <span className="text-gray-600">{professional.phone}</span>
              </div>
            )}
          </div>

          {/* Dias de trabalho */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-700">Dias de trabalho:</span>
            </div>
            <p className="text-sm text-gray-600 pl-6">{getWorkingDays()}</p>
          </div>

          {/* Horários de expediente */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-700">Expediente:</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-gray-600">
              {professional.first_shift_start && professional.first_shift_end && (
                <p>1º Turno: {formatTime(professional.first_shift_start)} - {formatTime(professional.first_shift_end)}</p>
              )}
              {professional.second_shift_start && professional.second_shift_end && (
                <p>2º Turno: {formatTime(professional.second_shift_start)} - {formatTime(professional.second_shift_end)}</p>
              )}
              {professional.weekend_shift_active && professional.weekend_shift_start && professional.weekend_shift_end && (
                <p>Fim de semana: {formatTime(professional.weekend_shift_start)} - {formatTime(professional.weekend_shift_end)}</p>
              )}
            </div>
          </div>

          {/* Pausas/Intervalos */}
          {getBreakTimes().length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Coffee className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-gray-700">Pausas:</span>
              </div>
              <div className="pl-6 space-y-1 text-sm text-gray-600">
                {getBreakTimes().map((breakTime: any, index: number) => (
                  <p key={index}>
                    {formatTime(breakTime.start)} - {formatTime(breakTime.end)}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Férias */}
          {professional.vacation_active && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-700">Férias:</span>
              </div>
              <div className="pl-6 text-sm text-gray-600">
                <p>
                  {formatDate(professional.vacation_start)} - {formatDate(professional.vacation_end)}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
