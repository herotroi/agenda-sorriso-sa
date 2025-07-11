
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Mail, Phone, Coffee, Plane, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Professional } from '../types';

interface ProfessionalCardProps {
  professional: Professional;
  onEdit: (professional: Professional) => void;
  onDelete: (professionalId: string, professionalName: string) => Promise<void>;
}

export function ProfessionalCard({ professional, onEdit, onDelete }: ProfessionalCardProps) {
  const formatBreakTimes = (breakTimes: any) => {
    if (!breakTimes || !Array.isArray(breakTimes) || breakTimes.length === 0) {
      return 'Sem pausas';
    }
    
    return breakTimes.map((breakTime: any) => 
      `${breakTime.start} - ${breakTime.end}`
    ).join(', ');
  };

  const formatVacationPeriod = (professional: Professional) => {
    if (!professional.vacation_active || !professional.vacation_start || !professional.vacation_end) {
      return 'Não está de férias';
    }
    
    const startDate = new Date(professional.vacation_start).toLocaleDateString('pt-BR');
    const endDate = new Date(professional.vacation_end).toLocaleDateString('pt-BR');
    
    return `${startDate} - ${endDate}`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: professional.color }}
            />
            <div>
              <h3 className="text-lg font-semibold">{professional.name}</h3>
              <div className="space-y-1">
                {professional.specialty && (
                  <p className="text-sm text-gray-600">
                    Especialidade: {professional.specialty}
                  </p>
                )}
                {professional.crm_cro && (
                  <p className="text-sm text-gray-600">
                    CRM/CRO: {professional.crm_cro}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {professional.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {professional.email}
                    </div>
                  )}
                  {professional.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {professional.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    Expediente: {professional.working_hours?.start || '08:00'} - {professional.working_hours?.end || '18:00'}
                  </span>
                  <Badge variant={professional.active ? 'default' : 'secondary'}>
                    {professional.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Coffee className="h-4 w-4" />
                  <span>Pausas: {formatBreakTimes(professional.break_times)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Plane className="h-4 w-4" />
                  <span>Férias: {formatVacationPeriod(professional)}</span>
                  {professional.vacation_active && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                      De férias
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(professional)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o profissional <strong>{professional.name}</strong>? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(professional.id, professional.name)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
