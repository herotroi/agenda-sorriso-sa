
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  sus_card?: string;
  health_insurance?: string;
  birth_date?: string;
  medical_history?: string;
  notes?: string;
}

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

interface PatientRecord {
  id: string;
  created_at: string;
  professionals: { name: string };
  appointments?: {
    procedures?: { name: string };
  };
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PatientForm({ isOpen, onClose, patient }: PatientFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    email: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    sus_card: '',
    health_insurance: '',
    birth_date: '',
    medical_history: '',
    notes: '',
  });
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Função para aplicar máscara de CPF
  const applyCpfMask = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // Função para aplicar máscara de telefone
  const applyPhoneMask = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
  };

  const fetchPatientRecords = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select(`
          id,
          created_at,
          professionals(name),
          appointments(
            procedures(name)
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error('Error fetching patient records:', error);
    }
  };

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        cpf: patient.cpf || '',
        phone: patient.phone || '',
        email: patient.email || '',
        street: patient.street || '',
        number: patient.number || '',
        neighborhood: patient.neighborhood || '',
        city: patient.city || '',
        state: patient.state || '',
        sus_card: patient.sus_card || '',
        health_insurance: patient.health_insurance || '',
        birth_date: patient.birth_date || '',
        medical_history: patient.medical_history || '',
        notes: patient.notes || '',
      });
      fetchPatientRecords(patient.id);
    } else if (isOpen) {
      setFormData({
        full_name: '',
        cpf: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        sus_card: '',
        health_insurance: '',
        birth_date: '',
        medical_history: '',
        notes: '',
      });
      setPatientRecords([]);
    }
  }, [patient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        birth_date: formData.birth_date || null,
        cpf: formData.cpf || null,
        phone: formData.phone || null,
        email: formData.email || null,
        street: formData.street || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        sus_card: formData.sus_card || null,
        health_insurance: formData.health_insurance || null,
        medical_history: formData.medical_history || null,
        notes: formData.notes || null,
      };

      if (patient) {
        const { error } = await supabase
          .from('patients')
          .update(data)
          .eq('id', patient.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente criado com sucesso',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar paciente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {patient && patientRecords.length > 0 && (
            <div>
              <Label>Histórico de Procedimentos</Label>
              <div className="mt-2 p-3 border rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                {patientRecords.map((record) => (
                  <div key={record.id} className="text-sm mb-2 last:mb-0">
                    <span className="font-medium">
                      {new Date(record.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    {' - '}
                    <span>
                      {record.appointments?.procedures?.name || 'Consulta'}
                    </span>
                    {' - '}
                    <span className="text-gray-600">
                      Dr(a). {record.professionals?.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="medical_history">Histórico Médico</Label>
            <Textarea
              id="medical_history"
              value={formData.medical_history}
              onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
              rows={3}
              placeholder="Alergias, medicamentos em uso, condições médicas..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.full_name}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
