
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Professional {
  id: string;
  name: string;
}

interface PatientRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export function PatientRecordForm({ isOpen, onClose, patientId }: PatientRecordFormProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [formData, setFormData] = useState({
    professional_id: '',
    notes: '',
    prescription: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfessionals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name')
        .eq('active', true)
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
      setFormData({
        professional_id: '',
        notes: '',
        prescription: '',
      });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !formData.professional_id || !formData.notes || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patient_records')
        .insert({
          patient_id: patientId,
          professional_id: formData.professional_id,
          notes: formData.notes,
          prescription: formData.prescription || null,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Consulta registrada com sucesso',
      });

      onClose();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar consulta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Consulta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="professional">Profissional *</Label>
            <Select value={formData.professional_id} onValueChange={(value) => setFormData({ ...formData, professional_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notas da Consulta *</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={6}
              placeholder="Descreva os procedimentos realizados, observações clínicas, etc."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="prescription">Receita/Prescrição</Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              rows={4}
              placeholder="Medicamentos prescritos, orientações, etc."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.professional_id || !formData.notes}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
