
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalCard } from './ProfessionalCard';
import { Professional } from '../types';

interface ProfessionalGridProps {
  professionals: Professional[];
  onEdit: (professional: Professional) => void;
  onDelete: (professional: Professional) => Promise<void>;
}

export function ProfessionalGrid({ professionals, onEdit, onDelete }: ProfessionalGridProps) {
  if (professionals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum profissional cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          professional={professional}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
