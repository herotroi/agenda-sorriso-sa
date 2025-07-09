
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  description?: string;
  active: boolean;
}

interface ProcedureFormProps {
  isOpen: boolean;
  onClose: () => void;
  procedure?: Procedure | null;
}

export function ProcedureForm({ isOpen, onClose, procedure }: ProcedureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    default_duration: '60',
    description: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (procedure) {
      setFormData({
        name: procedure.name,
        price: procedure.price.toString(),
        default_duration: procedure.default_duration.toString(),
        description: procedure.description || '',
        active: procedure.active,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        default_duration: '60',
        description: '',
        active: true,
      });
    }
  }, [procedure, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        price: parseFloat(formData.price),
        default_duration: parseInt(formData.default_duration),
        description: formData.description || null,
        active: formData.active,
      };

      if (procedure) {
        const { error } = await supabase
          .from('procedures')
          .update(data)
          .eq('id', procedure.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Procedimento atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('procedures')
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Procedimento criado com sucesso',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving procedure:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar procedimento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {procedure ? 'Editar Procedimento' : 'Novo Procedimento'}
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
            <Label htmlFor="price">Preço (R$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duração (minutos) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.default_duration}
              onChange={(e) => setFormData({ ...formData, default_duration: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
