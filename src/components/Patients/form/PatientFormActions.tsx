
import { Button } from '@/components/ui/button';

interface PatientFormActionsProps {
  onClose: () => void;
  loading: boolean;
  isFormValid: boolean;
}

export function PatientFormActions({ onClose, loading, isFormValid }: PatientFormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading || !isFormValid}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
}
