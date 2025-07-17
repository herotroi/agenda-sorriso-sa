
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PatientAdditionalInfoProps {
  formData: {
    weight_kg: string;
    height_cm: string;
    responsible_name: string;
    responsible_cpf: string;
  };
  setFormData: (data: any) => void;
  applyCpfMask: (value: string) => string;
}

export function PatientAdditionalInfo({ formData, setFormData, applyCpfMask }: PatientAdditionalInfoProps) {
  return (
    <div className="space-y-6">
      {/* Dados físicos */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Dados Físicos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight_kg">Peso (Kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="70.5"
            />
          </div>
          <div>
            <Label htmlFor="height_cm">Altura (cm)</Label>
            <Input
              id="height_cm"
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              placeholder="175"
            />
          </div>
        </div>
      </div>

      {/* Dados do responsável */}
      <div>
        <h4 className="text-md font-medium text-gray-800 mb-3">Responsável (se necessário)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="responsible_name">Nome do Responsável</Label>
            <Input
              id="responsible_name"
              value={formData.responsible_name}
              onChange={(e) => setFormData({ ...formData, responsible_name: e.target.value })}
              placeholder="Nome completo do responsável"
            />
          </div>
          <div>
            <Label htmlFor="responsible_cpf">CPF do Responsável</Label>
            <Input
              id="responsible_cpf"
              value={formData.responsible_cpf}
              onChange={(e) => {
                const maskedValue = applyCpfMask(e.target.value);
                setFormData({ ...formData, responsible_cpf: maskedValue });
              }}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
