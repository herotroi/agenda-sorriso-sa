
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BasicInfoSectionProps {
  formData: {
    name: string;
    specialty: string;
    crm_cro: string;
    email: string;
    phone: string;
    color: string;
  };
  setFormData: (data: any) => void;
}

export function BasicInfoSection({ formData, setFormData }: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Informações Básicas</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do profissional"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="specialty">Especialidade</Label>
          <Input
            id="specialty"
            type="text"
            value={formData.specialty || ''}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            placeholder="Especialidade"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="crm_cro">CRM/CRO</Label>
          <Input
            id="crm_cro"
            type="text"
            value={formData.crm_cro || ''}
            onChange={(e) => setFormData({ ...formData, crm_cro: e.target.value })}
            placeholder="CRM ou CRO"
          />
        </div>
        
        <div>
          <Label htmlFor="color">Cor</Label>
          <Input
            id="color"
            type="color"
            value={formData.color || '#3b82f6'}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
    </div>
  );
}
