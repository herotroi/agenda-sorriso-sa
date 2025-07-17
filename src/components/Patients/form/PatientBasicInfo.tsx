
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoCapture } from './PhotoCapture';

interface PatientBasicInfoProps {
  formData: {
    full_name: string;
    cpf: string;
    birth_date: string;
    photo_url: string;
    gender: string;
    profession: string;
    marital_status: string;
    phone: string;
  };
  setFormData: (data: any) => void;
  applyCpfMask: (value: string) => string;
}

export function PatientBasicInfo({ formData, setFormData, applyCpfMask }: PatientBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Foto do paciente no topo */}
      <div className="flex justify-center">
        <PhotoCapture
          photoUrl={formData.photo_url}
          onPhotoChange={(photoUrl) => setFormData({ ...formData, photo_url: photoUrl })}
          patientName={formData.full_name}
        />
      </div>
      
      {/* Informações básicas */}
      <div>
        <Label htmlFor="full_name">Nome Completo *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => {
              const maskedValue = applyCpfMask(e.target.value);
              setFormData({ ...formData, cpf: maskedValue });
            }}
            placeholder="000.000.000-00"
            maxLength={14}
            required
          />
        </div>
        <div>
          <Label htmlFor="birth_date">Data de Nascimento *</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Informações pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Sexo *</Label>
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
    </div>
  );
}
