import { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, Clock, Briefcase, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProfessionalDetailView } from '@/components/Calendar/ProfessionalDetailView';
import { Professional } from '@/types';

interface ProfessionalCardProps {
  professional: Professional;
  onUpdate: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function ProfessionalCard({ professional, onUpdate, onDelete }: ProfessionalCardProps) {
  console.log('ProfessionalCard professional data:', professional);
  
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const workingDaysLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const getActiveWorkingDays = () => {
    if (!professional.working_days || !Array.isArray(professional.working_days)) {
      return 'N/A';
    }
    return professional.working_days
      .map((isActive: boolean, index: number) => isActive ? workingDaysLabels[index] : null)
      .filter(Boolean)
      .join(', ') || 'Nenhum';
  };

  const getWorkingHours = () => {
    if (!professional.working_hours || typeof professional.working_hours !== 'object') {
      return 'N/A';
    }
    const { start, end } = professional.working_hours;
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getBreakTimes = () => {
    if (!professional.break_times || !Array.isArray(professional.break_times) || professional.break_times.length === 0) {
      return 'Nenhum';
    }
    return professional.break_times
      .map((breakTime: any) => `${formatTime(breakTime.start)} - ${formatTime(breakTime.end)}`)
      .join(', ');
  };

  const isOnVacation = () => {
    if (!professional.vacation_active || !professional.vacation_start || !professional.vacation_end) {
      return false;
    }
    const now = new Date();
    const vacationStart = new Date(professional.vacation_start);
    const vacationEnd = new Date(professional.vacation_end);
    return now >= vacationStart && now <= vacationEnd;
  };

  const handleDelete = async () => {
    try {
      await onDelete(professional.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting professional:', error);
    }
  };

  const handleViewDetails = () => {
    console.log('Opening detail view for professional:', professional.id);
    setShowDetailView(true);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: professional.color || '#3b82f6' }}
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {professional.name}
                </h3>
                {professional.specialty && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {professional.specialty}
                  </p>
                )}
                {professional.crm_cro && (
                  <p className="text-xs text-gray-500">
                    {professional.crm_cro}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {isOnVacation() && (
                <Badge variant="secondary" className="text-xs">
                  Em Férias
                </Badge>
              )}
              <Badge variant={professional.active ? "default" : "secondary"}>
                {professional.active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Informações de contato */}
          <div className="space-y-2">
            {professional.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{professional.email}</span>
              </div>
            )}
            {professional.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{professional.phone}</span>
              </div>
            )}
          </div>

          {/* Horários de trabalho */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 mr-1" />
                Horário de Trabalho
              </div>
              <p className="text-sm text-gray-600 pl-5">
                {getWorkingHours()}
              </p>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Dias de Trabalho
              </div>
              <p className="text-sm text-gray-600 pl-5">
                {getActiveWorkingDays()}
              </p>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Intervalos
              </div>
              <p className="text-sm text-gray-600 pl-5">
                {getBreakTimes()}
              </p>
            </div>
          </div>

          {/* Turnos extras */}
          {(professional.first_shift_start || professional.second_shift_start || professional.weekend_shift_active) && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Turnos Extras
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                {professional.first_shift_start && (
                  <div>1º Turno: {formatTime(professional.first_shift_start)} - {formatTime(professional.first_shift_end)}</div>
                )}
                {professional.second_shift_start && (
                  <div>2º Turno: {formatTime(professional.second_shift_start)} - {formatTime(professional.second_shift_end)}</div>
                )}
                {professional.weekend_shift_active && (
                  <div>Fim de Semana: {formatTime(professional.weekend_shift_start)} - {formatTime(professional.weekend_shift_end)}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewDetails}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Visualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onUpdate}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o profissional "{professional.name}"? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>

      {/* Detail View Modal */}
      {showDetailView && (
        <ProfessionalDetailView
          professional={professional}
          selectedDate={selectedDate}
          onClose={handleCloseDetailView}
        />
      )}
    </>
  );
}
