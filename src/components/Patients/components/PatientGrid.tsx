
import { Card, CardContent } from '@/components/ui/card';
import { PatientCard } from './PatientCard';
import { Patient } from '@/types/patient';

interface PatientGridProps {
  patients: Patient[];
  loading: boolean;
  searchTerm: string;
  onEdit: (patient: Patient) => void;
  onViewDetails: (patient: Patient) => void;
}

export function PatientGrid({ 
  patients, 
  loading, 
  searchTerm, 
  onEdit, 
  onViewDetails 
}: PatientGridProps) {
  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  if (patients.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onEdit={onEdit}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
