
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Professional {
  id: string;
  name: string;
  specialty?: string;
  crm_cro?: string;
  email?: string;
  phone?: string;
  color: string;
  working_hours: any;
  active: boolean;
}

interface ProfessionalFormProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional | null;
}

export function ProfessionalForm({ isOpen, onClose, professional }: ProfessionalFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    crm_cro: '',
    email: '',
    phone: '',
    color: '#3b82f6',
    working_hours_start: '08:00',
    working_hours_end: '18:00',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || '',
        specialty: professional.specialty || '',
        crm_cro: professional.crm_cro || '',
        email: professional.email || '',
        phone: professional.phone || '',
        color: professional.color || '#3b82f6',
        working_hours_start: professional.working_hours?.start || '08:00',
        working_hours_end: professional.working_hours?.end || '18:00',
        active: professional.active,
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        specialty: '',
        crm_cro: '',
        email: '',
        phone: '',
        color: '#3b82f6',
        working_hours_start: '08:00',
        working_hours_end: '18:00',
        active: true,
      });
    }
  }, [professional, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        specialty: formData.specialty || null,
        crm_cro: formData.crm_cro || null,
        email: formData.email || null,
        phone: formData.phone || null,
        color: formData.color,
        working_hours: {
          start: formData.working_hours_start,
          end: formData.working_hours_end,
        },
        active: formData.active,
      };

      if (professional) {
        const { error } = await supabase
          .from('professionals')
          .update(data)
          .eq('id', professional.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Profissional atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('professionals')
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Profissional criado com sucesso',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving professional:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar profissional',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {professional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="specialty">Especialidade</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Ex: Ortodontia, Endodontia..."
            />
          </div>

          <div>
            <Label htmlFor="crm_cro">CRM/CRO</Label>
            <Input
              id="crm_cro"
              value={formData.crm_cro}
              onChange={(e) => setFormData({ ...formData, crm_cro: e.target.value })}
              placeholder="Ex: CRO-12345"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 9999-9999"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="color">Cor do Calendário</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Início do Expediente</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.working_hours_start}
                onChange={(e) => setFormData({ ...formData, working_hours_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time">Fim do Expediente</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.working_hours_end}
                onChange={(e) => setFormData({ ...formData, working_hours_end: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
