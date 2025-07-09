
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
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

export function PatientForm({ isOpen, onClose, patient }: PatientFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    sus_card: '',
    health_insurance: '',
    birth_date: '',
    medical_history: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        cpf: patient.cpf || '',
        phone: patient.phone || '',
        whatsapp: patient.whatsapp || '',
        email: patient.email || '',
        address: patient.address || '',
        sus_card: patient.sus_card || '',
        health_insurance: patient.health_insurance || '',
        birth_date: patient.birth_date || '',
        medical_history: patient.medical_history || '',
        notes: patient.notes || '',
      });
    } else if (isOpen) {
      setFormData({
        full_name: '',
        cpf: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        sus_card: '',
        health_insurance: '',
        birth_date: '',
        medical_history: '',
        notes: '',
      });
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
        whatsapp: formData.whatsapp || null,
        email: formData.email || null,
        address: formData.address || null,
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
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
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 9999-9999"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="(11) 9999-9999"
              />
            </div>
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

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
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
