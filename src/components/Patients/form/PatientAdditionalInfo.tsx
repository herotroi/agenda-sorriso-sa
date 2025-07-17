
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoCapture } from './PhotoCapture';

interface PatientAdditionalInfoProps {
  formData: {
    photo_url: string;
    gender: string;
    profession: string;
    marital_status: string;
    weight_kg: string;
    height_cm: string;
    responsible_name: string;
    responsible_cpf: string;
    full_name: string;
  };
  setFormData: (data: any) => void;
  applyCpfMask: (value: string) => string;
}

export function PatientAdditionalInfo({ formData, setFormData, applyCpfMask }: PatientAdditionalInfoProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Informações Pessoais</h3>
      
      {/* Foto do paciente */}
      <div className="flex justify-center">
        <PhotoCapture
          photoUrl={formData.photo_url}
          onPhotoChange={(photoUrl) => setFormData({ ...formData, photo_url: photoUrl })}
          patientName={formData.full_name}
        />
      </div>
      
      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Sexo</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="marital_status">Estado Civil</Label>
          <Select value={formData.marital_status} onValueChange={(value) => setFormData({ ...formData, marital_status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado civil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solteiro">Solteiro</SelectItem>
              <SelectItem value="casado">Casado</SelectItem>
              <SelectItem value="viuvo">Viúvo</SelectItem>
              <SelectItem value="divorciado">Divorciado</SelectItem>
              <SelectItem value="uniao_estavel">União Estável</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="profession">Profissão</Label>
        <Input
          id="profession"
          value={formData.profession}
          onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
          placeholder="Ex: Engenheiro, Professor, etc."
        />
      </div>

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
