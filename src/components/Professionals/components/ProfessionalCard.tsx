
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  UserCheck,
  UserX,
  Stethoscope,
  IdCard
} from 'lucide-react';
import { Professional } from '@/types';
import { ProfessionalForm } from '../ProfessionalForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ProfessionalDetailView } from '@/components/Calendar/ProfessionalDetailView';

interface ProfessionalCardProps {
  professional: Professional;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export function ProfessionalCard({ professional, onUpdate, onDelete }: ProfessionalCardProps) {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  const handleEditFormClose = (success?: boolean) => {
    setIsEditFormOpen(false);
    if (success) {
      onUpdate();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar 
                className="h-12 w-12 border-2" 
                style={{ borderColor: professional.color }}
              >
                <AvatarFallback 
                  className="text-white font-semibold"
                  style={{ backgroundColor: professional.color }}
                >
                  {getInitials(professional.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{professional.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(professional.active || false)} border-0`}
                >
                  {getStatusIcon(professional.active || false)}
                  {professional.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailViewOpen(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditFormOpen(true)}
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Profissional</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o profissional {professional.name}? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(professional.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {professional.specialty && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stethoscope className="h-4 w-4" />
              <span>{professional.specialty}</span>
            </div>
          )}

          {professional.crm_cro && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <IdCard className="h-4 w-4" />
              <span>{professional.crm_cro}</span>
            </div>
          )}

          {professional.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{professional.email}</span>
            </div>
          )}

          {professional.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>{professional.phone}</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Horários de Trabalho:</span>
            </div>
            
            {professional.first_shift_start && professional.first_shift_end && (
              <div className="text-xs text-gray-500 ml-6">
                Turno 1: {professional.first_shift_start} - {professional.first_shift_end}
              </div>
            )}
            
            {professional.second_shift_start && professional.second_shift_end && (
              <div className="text-xs text-gray-500 ml-6">
                Turno 2: {professional.second_shift_start} - {professional.second_shift_end}
              </div>
            )}
            
            {professional.weekend_shift_active && professional.weekend_shift_start && professional.weekend_shift_end && (
              <div className="text-xs text-gray-500 ml-6">
                Fins de semana: {professional.weekend_shift_start} - {professional.weekend_shift_end}
              </div>
            )}
          </div>

          {professional.vacation_active && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Em férias</span>
              {professional.vacation_start && professional.vacation_end && (
                <span className="text-xs">
                  ({new Date(professional.vacation_start).toLocaleDateString()} - {new Date(professional.vacation_end).toLocaleDateString()})
                </span>
              )}
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailViewOpen(true)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ver Agenda
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfessionalForm
        isOpen={isEditFormOpen}
        onClose={handleEditFormClose}
        professional={professional}
      />

      <ProfessionalDetailView
        professional={professional}
        selectedDate={new Date()}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
      />
    </>
  );
}
