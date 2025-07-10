
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PatientHealthInfoProps {
  formData: {
    sus_card: string;
    health_insurance: string;
  };
  setFormData: (data: any) => void;
}

export function PatientHealthInfo({ formData, setFormData }: PatientHealthInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="sus_card">Cartão SUS</Label>
        <Input
          id="sus_card"
          value={formData.sus_card}
          onChange={(e) => setFormData({ ...formData, sus_card: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="health_insurance">Plano de Saúde</Label>
        <Input
          id="health_insurance"
          value={formData.health_insurance}
          onChange={(e) => setFormData({ ...formData, health_insurance: e.target.value })}
        />
      </div>
    </div>
  );
}
