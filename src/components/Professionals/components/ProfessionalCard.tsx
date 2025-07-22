
import { useState } from 'react';
import { Edit, Trash2, Eye, Calendar, Clock, Briefcase, Mail, Phone, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProfessionalDetailView } from '@/components/Calendar/ProfessionalDetailView';
import { ProfessionalForm } from '@/components/Professionals/ProfessionalForm';
import type { Professional } from '@/types';
import { isDateInVacationPeriod } from '@/utils/vacationDateUtils';

interface ProfessionalCardProps {
  professional: Professional;
  onUpdate: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function ProfessionalCard({ professional, onUpdate, onDelete }: ProfessionalCardProps) {
  console.log('ProfessionalCard professional data:', professional);
  
  const [showDetailView, setShowDetailView] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Array dos dias da semana conforme cadastrado no banco: [Seg, Ter, Qua, Qui, Sex, Sáb, Dom]
  const workingDaysLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const formatTime = (time: string | null | undefined) => {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  };

  const getActiveWorkingDays = () => {
    // Usar padrão seg-sex se não houver dados: [true, true, true, true, true, false, false]
    let workingDays = [true, true, true, true, true, false, false];
    
    // Parse working_days from database
    if (professional.working_days) {
      try {
        if (Array.isArray(professional.working_days)) {
          workingDays = professional.working_days;
        } else if (typeof professional.working_days === 'string') {
          workingDays = JSON.parse(professional.working_days);
        }
      } catch (e) {
        console.warn('Failed to parse working_days:', e);
      }
    }
    
    console.log('Working days array:', workingDays);
    
    // Get active working days baseado no array real do banco
    const activeDays = workingDays
      .map((isActive: boolean, index: number) => isActive ? workingDaysLabels[index] : null)
      .filter(Boolean);
    
    return activeDays.length > 0 ? activeDays.join(', ') : 'Nenhum dia configurado';
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
    return isDateInVacationPeriod(now, professional.vacation_start, professional.vacation_end);
  };

  const getVacationPeriod = () => {
    if (!professional.vacation_active || !professional.vacation_start || !professional.vacation_end) {
      return null;
    }
    
    const startDate = new Date(professional.vacation_start + 'T00:00:00');
    const endDate = new Date(professional.vacation_end + 'T00:00:00');
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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

  const handleEdit = () => {
    console.log('Opening edit form for professional:', professional.id);
    setShowEditForm(true);
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    onUpdate();
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
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                  <Plane className="h-3 w-3 mr-1" />
                  Em Férias
                </Badge>
              )}
              <Badge variant={(professional.active ?? true) ? "default" : "secondary"}>
                {(professional.active ?? true) ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
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

            {/* Mostrar período de férias se estiver ativo */}
            {professional.vacation_active && getVacationPeriod() && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Plane className="h-4 w-4 mr-1" />
                  Período de Férias
                </div>
                <p className="text-sm text-gray-600 pl-5">
                  {getVacationPeriod()}
                </p>
              </div>
            )}
          </div>

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
              onClick={handleEdit}
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

      {showDetailView && (
        <ProfessionalDetailView
          professional={professional}
          selectedDate={selectedDate}
          isOpen={showDetailView}
          onClose={handleCloseDetailView}
        />
      )}

      {showEditForm && (
        <ProfessionalForm
          isOpen={showEditForm}
          onClose={handleCloseEditForm}
          professional={professional}
        />
      )}
    </>
  );
}
