
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BasicInfoSection } from './form/BasicInfoSection';
import { WorkingHoursSection } from './form/WorkingHoursSection';
import { FormActions } from './form/FormActions';

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
  working_days?: boolean[];
  weekend_shift_active?: boolean;
  weekend_shift_start?: string;
  weekend_shift_end?: string;
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
    working_days: [true, true, true, true, true, false, false] as boolean[], // Segunda a sexta por padrão
    weekend_shift_active: false,
    weekend_shift_start: '08:00',
    weekend_shift_end: '12:00',
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
        working_days: professional.working_days || [true, true, true, true, true, false, false],
        weekend_shift_active: professional.weekend_shift_active || false,
        weekend_shift_start: professional.weekend_shift_start || '08:00',
        weekend_shift_end: professional.weekend_shift_end || '12:00',
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
        working_days: [true, true, true, true, true, false, false],
        weekend_shift_active: false,
        weekend_shift_start: '08:00',
        weekend_shift_end: '12:00',
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
        working_days: formData.working_days,
        weekend_shift_active: formData.weekend_shift_active,
        weekend_shift_start: formData.weekend_shift_active ? formData.weekend_shift_start : null,
        weekend_shift_end: formData.weekend_shift_active ? formData.weekend_shift_end : null,
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
          <BasicInfoSection
            formData={{
              name: formData.name,
              specialty: formData.specialty,
              crm_cro: formData.crm_cro,
              email: formData.email,
              phone: formData.phone,
              color: formData.color,
            }}
            setFormData={setFormData}
          />

          <WorkingHoursSection
            formData={{
              first_shift_start: formData.first_shift_start,
              first_shift_end: formData.first_shift_end,
              second_shift_start: formData.second_shift_start,
              second_shift_end: formData.second_shift_end,
              break_times: formData.break_times,
              vacation_active: formData.vacation_active,
              vacation_start: formData.vacation_start,
              vacation_end: formData.vacation_end,
              working_days: formData.working_days,
              weekend_shift_active: formData.weekend_shift_active,
              weekend_shift_start: formData.weekend_shift_start,
              weekend_shift_end: formData.weekend_shift_end,
            }}
            setFormData={setFormData}
          />

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>

          <FormActions
            onCancel={onClose}
            loading={loading}
            isNameValid={!!formData.name}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
