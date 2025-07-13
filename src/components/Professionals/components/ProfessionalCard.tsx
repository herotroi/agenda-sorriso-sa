
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Professional } from '@/types';

interface ProfessionalCardProps {
  professional: Professional;
  onEdit: (professional: Professional) => void;
  onDelete: (professionalId: string, professionalName: string) => Promise<void>;
}

export function ProfessionalCard({ professional, onEdit, onDelete }: ProfessionalCardProps) {
  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o profissional ${professional.name}?`)) {
      await onDelete(professional.id, professional.name);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: professional.calendarColor || '#3b82f6' }}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {professional.name}
              </h3>
              <Badge variant={professional.isActive ? 'default' : 'secondary'}>
                {professional.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              {professional.specialty && (
                <p><span className="font-medium">Especialidade:</span> {professional.specialty}</p>
              )}
              {professional.cro && (
                <p><span className="font-medium">CRM/CRO:</span> {professional.cro}</p>
              )}
              {professional.email && (
                <p><span className="font-medium">Email:</span> {professional.email}</p>
              )}
              {professional.phone && (
                <p><span className="font-medium">Telefone:</span> {professional.phone}</p>
              )}
              
              {/* Horários de trabalho */}
              <div className="mt-3">
                <p className="font-medium text-gray-700 mb-1">Horários:</p>
                {professional.workingHours && (
                  <div className="space-y-1">
                    {Object.entries(professional.workingHours).map(([day, schedule]) => {
                      if (schedule.isWorking) {
                        return (
                          <p key={day} className="text-xs">
                            {day}: {schedule.startTime} - {schedule.endTime}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(professional)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
