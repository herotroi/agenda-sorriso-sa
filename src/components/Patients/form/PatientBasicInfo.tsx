
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PatientBasicInfoProps {
  formData: {
    full_name: string;
    cpf: string;
    birth_date: string;
  };
  setFormData: (data: any) => void;
  applyCpfMask: (value: string) => string;
}

export function PatientBasicInfo({ formData, setFormData, applyCpfMask }: PatientBasicInfoProps) {
  return (
    <>
      <div>
        <Label htmlFor="full_name">Nome Completo *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => {
              const maskedValue = applyCpfMask(e.target.value);
              setFormData({ ...formData, cpf: maskedValue });
            }}
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
        <div>
          <Label htmlFor="birth_date">Data de Nascimento</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
