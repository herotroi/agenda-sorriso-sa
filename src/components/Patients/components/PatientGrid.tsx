
import { PatientCard } from './PatientCard';
import { Patient } from '@/types/patient';

interface PatientGridProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onViewDetails: (patient: Patient) => void;
  onDelete: (patientId: string, patientName: string) => Promise<void>;
}

export function PatientGrid({ patients, onEdit, onViewDetails, onDelete }: PatientGridProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <svg 
            className="w-12 h-12 text-muted-foreground" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Nenhum paciente encontrado
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Adicione o primeiro paciente para começar a gerenciar sua base de pacientes.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
        {patients.map((patient) => (
          <div key={patient.id} className="flex">
            <PatientCard
              patient={patient}
              onEdit={onEdit}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
