
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Stethoscope, Pill, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

interface EditRecordDialogProps {
  record: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdated: () => void;
}

export function EditRecordDialog({ record, isOpen, onClose, onRecordUpdated }: EditRecordDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    prescription: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (record) {
      setFormData({
        title: record.title || '',
        content: record.content || record.notes || '',
        prescription: record.prescription || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        prescription: '',
      });
    }
  }, [record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record || !user) {
      toast({
        title: 'Erro',
        description: 'Dados inválidos para atualização',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'As anotações da consulta são obrigatórias',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        title: formData.title.trim() || null,
        content: formData.content.trim() || null,
        notes: formData.content.trim() || null, // Manter compatibilidade com campo notes
        prescription: formData.prescription.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('patient_records')
        .update(updateData)
        .eq('id', record.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Registro atualizado com sucesso',
      });

      onRecordUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar registro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Editar Registro do Prontuário</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Última atualização: {format(new Date(record.updated_at), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Record Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">
                  {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
              
              {record.professionals && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Profissional:</span>
                  <span className="font-medium">Dr(a). {record.professionals.name}</span>
                </div>
              )}
              
              {record.appointments?.procedures && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Stethoscope className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Procedimento:</span>
                  <span className="font-medium">{record.appointments.procedures.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Título da Consulta
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Consulta de retorno, Primeira consulta, etc."
              className="h-12"
            />
            <p className="text-sm text-gray-500">Campo opcional para identificar o tipo de consulta</p>
          </div>

          {/* Anotações da Consulta */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Anotações da Consulta *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descreva as observações da consulta, sintomas relatados, exame físico, diagnóstico, tratamento recomendado, orientações..."
              rows={8}
              required
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Descreva detalhadamente o que foi observado e discutido na consulta
            </p>
          </div>

          {/* Receita/Prescrição */}
          <div className="space-y-2">
            <Label htmlFor="prescription" className="text-base font-medium flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Receita/Prescrição Médica
            </Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Liste os medicamentos prescritos, dosagens, frequência, duração do tratamento, instruções especiais..."
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              Medicamentos, dosagens e instruções de uso (campo opcional)
            </p>
          </div>

          {/* Actions */}
          <Separator />
          
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.content.trim()}
              className="sm:w-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
