
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
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

    setLoading(true);

    try {
      const updateData = {
        title: formData.title || null,
        content: formData.content || null,
        notes: formData.content || null, // Manter compatibilidade com campo notes
        prescription: formData.prescription || null,
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Registro do Prontuário</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título do registro"
            />
          </div>

          <div>
            <Label htmlFor="content">Anotações da Consulta *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descreva as observações, diagnóstico, tratamento..."
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="prescription">Receita/Prescrição</Label>
            <Textarea
              id="prescription"
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="Medicamentos, dosagens, instruções..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
