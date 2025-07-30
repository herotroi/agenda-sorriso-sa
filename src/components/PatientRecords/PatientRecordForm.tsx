
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User, FileText, Pill, Calendar } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
            Nova Consulta
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Professional Selection Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                Profissional Responsável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.professional_id} 
                onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o profissional responsável pela consulta" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Dr(a).
                        </Badge>
                        {prof.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Clinical Notes Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
                Notas da Consulta
                <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={8}
                placeholder="Descreva detalhadamente:
• Queixa principal do paciente
• Exame físico realizado
• Diagnóstico ou hipótese diagnóstica
• Procedimentos realizados
• Orientações fornecidas ao paciente
• Observações clínicas relevantes"
                className="text-base resize-none focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.notes.length} caracteres
              </div>
            </CardContent>
          </Card>

          {/* Prescription Card */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-4 w-4" />
                Receita / Prescrição
                <Badge variant="secondary" className="text-xs">Opcional</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                rows={6}
                placeholder="Prescreva medicamentos, tratamentos ou orientações:
• Medicamentos com dosagem e posologia
• Tratamentos complementares
• Recomendações de exames
• Orientações de retorno
• Cuidados especiais"
                className="text-base resize-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.prescription.length} caracteres
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.professional_id || !formData.notes}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Consulta'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
