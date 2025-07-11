
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  loading: boolean;
  isNameValid: boolean;
}

export function FormActions({ onCancel, loading, isNameValid }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading || !isNameValid}>
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
}
