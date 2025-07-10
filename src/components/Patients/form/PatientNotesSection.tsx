
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface PatientNotesSectionProps {
  formData: {
    notes: string;
  };
  setFormData: (data: any) => void;
}

export function PatientNotesSection({ formData, setFormData }: PatientNotesSectionProps) {
  return (
    <div>
      <Label htmlFor="notes">Observações</Label>
      <Textarea
        id="notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={2}
      />
    </div>
  );
}
