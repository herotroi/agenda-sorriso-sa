
import { Label } from '@/components/ui/label';

interface PatientRecord {
  id: string;
  created_at: string;
  professionals: { name: string };
  appointments?: {
    procedures?: { name: string };
  };
}

interface PatientMedicalHistoryProps {
  patientRecords: PatientRecord[];
}

export function PatientMedicalHistory({ patientRecords }: PatientMedicalHistoryProps) {
  if (patientRecords.length === 0) {
    return null;
  }

  return (
    <div>
      <Label>Histórico de Procedimentos</Label>
      <div className="mt-2 p-3 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
        {patientRecords.map((record) => (
          <div key={record.id} className="text-sm mb-2 last:mb-0">
            <span className="font-medium">
              {new Date(record.created_at).toLocaleDateString('pt-BR')}
            </span>
            {' - '}
            <span>
              {record.appointments?.procedures?.name || 'Consulta'}
            </span>
            {' - '}
            <span className="text-gray-600">
              Dr(a). {record.professionals?.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
