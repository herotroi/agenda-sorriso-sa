
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientAddressInfoProps {
  formData: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  setFormData: (data: any) => void;
  brazilianStates: string[];
}

export function PatientAddressInfo({ formData, setFormData, brazilianStates }: PatientAddressInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Endereço</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label htmlFor="street">Rua/Avenida</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="Nome da rua"
          />
        </div>
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="123"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
            placeholder="Nome do bairro"
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="Nome da cidade"
          />
        </div>
        <div>
          <Label htmlFor="state">UF</Label>
          <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {brazilianStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
