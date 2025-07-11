
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShiftTimeSection } from './form/ShiftTimeSection';
import { BreakTimesSection } from './form/BreakTimesSection';
import { VacationSection } from './form/VacationSection';

interface Professional {
  id: string;
  name: string;
  specialty?: string;
  crm_cro?: string;
  email?: string;
  phone?: string;
  color: string;
  working_hours: any;
  first_shift_start?: string;
  first_shift_end?: string;
  second_shift_start?: string;
  second_shift_end?: string;
  break_times?: any[];
  vacation_active?: boolean;
  vacation_start?: string;
  vacation_end?: string;
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
    first_shift_start: '08:00',
    first_shift_end: '12:00',
    second_shift_start: '13:30',
    second_shift_end: '18:00',
    break_times: [] as { start: string; end: string }[],
    vacation_active: false,
    vacation_start: '',
    vacation_end: '',
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
        first_shift_start: professional.first_shift_start || '08:00',
        first_shift_end: professional.first_shift_end || '12:00',
        second_shift_start: professional.second_shift_start || '13:30',
        second_shift_end: professional.second_shift_end || '18:00',
        break_times: professional.break_times || [],
        vacation_active: professional.vacation_active || false,
        vacation_start: professional.vacation_start || '',
        vacation_end: professional.vacation_end || '',
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
        first_shift_start: '08:00',
        first_shift_end: '12:00',
        second_shift_start: '13:30',
        second_shift_end: '18:00',
        break_times: [],
        vacation_active: false,
        vacation_start: '',
        vacation_end: '',
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
          start: formData.first_shift_start,
          end: formData.second_shift_end,
        },
        first_shift_start: formData.first_shift_start,
        first_shift_end: formData.first_shift_end,
        second_shift_start: formData.second_shift_start,
        second_shift_end: formData.second_shift_end,
        break_times: formData.break_times,
        vacation_active: formData.vacation_active,
        vacation_start: formData.vacation_active ? formData.vacation_start || null : null,
        vacation_end: formData.vacation_active ? formData.vacation_end || null : null,
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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {professional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Básicas</h3>
            <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Expediente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Expediente</h3>
            <div className="grid grid-cols-2 gap-6">
              <ShiftTimeSection
                title="Primeiro Expediente"
                startTime={formData.first_shift_start}
                endTime={formData.first_shift_end}
                onStartTimeChange={(time) => setFormData({ ...formData, first_shift_start: time })}
                onEndTimeChange={(time) => setFormData({ ...formData, first_shift_end: time })}
                startId="first_shift_start"
                endId="first_shift_end"
              />
              <ShiftTimeSection
                title="Segundo Expediente"
                startTime={formData.second_shift_start}
                endTime={formData.second_shift_end}
                onStartTimeChange={(time) => setFormData({ ...formData, second_shift_start: time })}
                onEndTimeChange={(time) => setFormData({ ...formData, second_shift_end: time })}
                startId="second_shift_start"
                endId="second_shift_end"
              />
            </div>
          </div>

          {/* Pausas */}
          <div>
            <BreakTimesSection
              breakTimes={formData.break_times}
              onBreakTimesChange={(breakTimes) => setFormData({ ...formData, break_times: breakTimes })}
            />
          </div>

          {/* Férias */}
          <div>
            <VacationSection
              vacationActive={formData.vacation_active}
              vacationStart={formData.vacation_start}
              vacationEnd={formData.vacation_end}
              onVacationActiveChange={(active) => setFormData({ ...formData, vacation_active: active })}
              onVacationStartChange={(date) => setFormData({ ...formData, vacation_start: date })}
              onVacationEndChange={(date) => setFormData({ ...formData, vacation_end: date })}
            />
          </div>

          {/* Status */}
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
