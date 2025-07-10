
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Phone, Mail, MapPin, Eye } from 'lucide-react';
import { Patient } from '@/types/patient';

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onViewDetails: (patient: Patient) => void;
}

export function PatientCard({ patient, onEdit, onViewDetails }: PatientCardProps) {
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
    <Card className={patient.active === false ? 'opacity-60' : ''}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{patient.full_name}</h3>
              {patient.active === false && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                  Inativo
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {patient.cpf && (
                <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>
              )}
              {patient.birth_date && (
                <p className="text-sm text-gray-600">
                  Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {patient.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {patient.phone}
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {patient.email}
                  </div>
                )}
              </div>
              {formatAddress(patient) && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {formatAddress(patient)}
                </div>
              )}
              {patient.health_insurance && (
                <p className="text-sm text-gray-600">
                  Plano: {patient.health_insurance}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(patient)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(patient)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
