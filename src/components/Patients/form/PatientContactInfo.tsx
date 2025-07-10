
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PatientContactInfoProps {
  formData: {
    phone: string;
    email: string;
  };
  setFormData: (data: any) => void;
  applyPhoneMask: (value: string) => string;
}

export function PatientContactInfo({ formData, setFormData, applyPhoneMask }: PatientContactInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => {
            const maskedValue = applyPhoneMask(e.target.value);
            setFormData({ ...formData, phone: maskedValue });
          }}
          placeholder="(11) 99999-9999"
          maxLength={15}
        />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
    </div>
  );
}
