
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Phone, Mail, MapPin, Eye, Trash2 } from 'lucide-react';
import { Patient } from '@/types/patient';
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

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onViewDetails: (patient: Patient) => void;
  onDelete: (patientId: string, patientName: string) => Promise<void>;
}

export function PatientCard({ patient, onEdit, onViewDetails, onDelete }: PatientCardProps) {
  const formatAddress = (patient: Patient) => {
    const parts = [];
    if (patient.street) parts.push(patient.street);
    if (patient.number) parts.push(patient.number);
    if (patient.neighborhood) parts.push(patient.neighborhood);
    if (patient.city) parts.push(patient.city);
    if (patient.state) parts.push(patient.state);
    return parts.join(', ');
  };

  return (
    <Card className={`w-full h-full ${patient.active === false ? 'opacity-60' : ''}`}>
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex flex-col space-y-4 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {patient.full_name}
                </h3>
                {patient.active === false && (
                  <span className="px-2 py-1 text-xs bg-destructive/10 text-destructive rounded-md whitespace-nowrap">
                    Inativo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-2 flex-1">
            {patient.cpf && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">CPF:</span> {patient.cpf}
              </p>
            )}
            {patient.birth_date && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Nascimento:</span> {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="space-y-1">
              {patient.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>

            {/* Address */}
            {formatAddress(patient) && (
              <div className="flex items-start text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="break-words">{formatAddress(patient)}</span>
              </div>
            )}

            {/* Health Insurance */}
            {patient.health_insurance && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Plano:</span> {patient.health_insurance}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(patient)}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Ver Detalhes</span>
                <span className="sm:hidden">Ver</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(patient)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o paciente "{patient.full_name}"? 
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(patient.id, patient.full_name)}
                    className="bg-destructive hover:bg-destructive/90"
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
