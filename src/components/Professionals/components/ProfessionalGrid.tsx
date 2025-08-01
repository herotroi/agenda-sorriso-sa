
import { Card, CardContent } from '@/components/ui/card';
import { ProfessionalCard } from './ProfessionalCard';
import { Professional } from '@/types';

interface ProfessionalGridProps {
  professionals: Professional[];
  onEdit: (professional: Professional) => void;
  onDelete: (professionalId: string) => Promise<void>;
  onUpdate: () => void;
}

export function ProfessionalGrid({ professionals, onEdit, onDelete, onUpdate }: ProfessionalGridProps) {
  if (professionals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum profissional cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async (id: string) => {
    await onDelete(id);
    onUpdate(); // Atualiza a lista após exclusão
  };

  return (
    <div className="grid gap-4">
      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          professional={professional}
          onUpdate={onUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
