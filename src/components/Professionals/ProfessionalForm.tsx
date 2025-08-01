import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BasicInfoSection } from './form/BasicInfoSection';
import { WorkingHoursSection } from './form/WorkingHoursSection';
import { FormActions } from './form/FormActions';
import type { Professional } from '@/types';

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
    working_days: [true, true, true, true, true, false, false] as boolean[],
    weekend_shift_active: false,
    weekend_shift_start: '08:00',
    weekend_shift_end: '12:00',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (professional) {
      console.log('Loading professional data:', professional);
      
      // Garantir que os dados estão no formato correto
      const formatTime = (time: string) => {
        if (!time) return '';
        if (time.includes(':')) {
          return time.substring(0, 5); // Remover segundos se houver
        }
        return time;
      };

      setFormData({
        name: professional.name || '',
        specialty: professional.specialty || '',
        crm_cro: professional.crm_cro || '',
        email: professional.email || '',
        phone: professional.phone || '',
        color: professional.color || '#3b82f6',
        first_shift_start: formatTime(professional.first_shift_start) || '08:00',
        first_shift_end: formatTime(professional.first_shift_end) || '12:00',
        second_shift_start: formatTime(professional.second_shift_start) || '13:30',
        second_shift_end: formatTime(professional.second_shift_end) || '18:00',
        break_times: Array.isArray(professional.break_times) ? professional.break_times : [],
        vacation_active: professional.vacation_active || false,
        vacation_start: professional.vacation_start || '',
        vacation_end: professional.vacation_end || '',
        working_days: Array.isArray(professional.working_days) ? professional.working_days : [true, true, true, true, true, false, false],
        weekend_shift_active: professional.weekend_shift_active || false,
        weekend_shift_start: formatTime(professional.weekend_shift_start) || '08:00',
        weekend_shift_end: formatTime(professional.weekend_shift_end) || '12:00',
        active: professional.active !== undefined ? professional.active : true,
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
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    console.log('Submitting form data:', formData);

    try {
      const data = {
        name: formData.name.trim(),
        specialty: formData.specialty?.trim() || null,
        crm_cro: formData.crm_cro?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
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
        user_id: user.id,
      };

      console.log('Sending data to database:', data);

      if (professional) {
        const { error } = await supabase
          .from('professionals')
          .update(data)
          .eq('id', professional.id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        toast({
          title: 'Sucesso',
          description: 'Profissional atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('professionals')
          .insert(data);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

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
        description: `Erro ao salvar profissional: ${error.message || 'Erro desconhecido'}`,
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
            setFormData={(data) => setFormData({ ...formData, ...data })}
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
            setFormData={(data) => setFormData({ ...formData, ...data })}
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
            isNameValid={!!formData.name?.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
