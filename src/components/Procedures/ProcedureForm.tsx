
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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

interface Professional {
  id: string;
  name: string;
  specialty?: string;
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
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, specialty, active')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const fetchProcedureProfessionals = async (procedureId: string) => {
    try {
      const { data, error } = await supabase
        .from('procedure_professionals')
        .select('professional_id')
        .eq('procedure_id', procedureId);

      if (error) throw error;
      setSelectedProfessionals(data?.map(item => item.professional_id) || []);
    } catch (error) {
      console.error('Error fetching procedure professionals:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfessionals();
      
      if (procedure) {
        setFormData({
          name: procedure.name,
          price: procedure.price.toString(),
          default_duration: procedure.default_duration.toString(),
          description: procedure.description || '',
          active: procedure.active,
        });
        fetchProcedureProfessionals(procedure.id);
      } else {
        setFormData({
          name: '',
          price: '',
          default_duration: '60',
          description: '',
          active: true,
        });
        setSelectedProfessionals([]);
      }
    }
  }, [procedure, isOpen]);

  const handleProfessionalToggle = (professionalId: string) => {
    setSelectedProfessionals(prev => 
      prev.includes(professionalId)
        ? prev.filter(id => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  const saveProcedureProfessionals = async (procedureId: string) => {
    // Primeiro, remove todas as associações existentes
    await supabase
      .from('procedure_professionals')
      .delete()
      .eq('procedure_id', procedureId);

    // Então, adiciona as novas associações
    if (selectedProfessionals.length > 0) {
      const associations = selectedProfessionals.map(professionalId => ({
        procedure_id: procedureId,
        professional_id: professionalId,
      }));

      const { error } = await supabase
        .from('procedure_professionals')
        .insert(associations);

      if (error) throw error;
    }
  };

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

      let procedureId: string;

      if (procedure) {
        const { error } = await supabase
          .from('procedures')
          .update(data)
          .eq('id', procedure.id);

        if (error) throw error;
        procedureId = procedure.id;

        toast({
          title: 'Sucesso',
          description: 'Procedimento atualizado com sucesso',
        });
      } else {
        const { data: newProcedure, error } = await supabase
          .from('procedures')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        procedureId = newProcedure.id;

        toast({
          title: 'Sucesso',
          description: 'Procedimento criado com sucesso',
        });
      }

      // Salvar associações com profissionais
      await saveProcedureProfessionals(procedureId);

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
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
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

          <div>
            <Label className="text-base font-medium">Profissionais Responsáveis</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded p-3">
              {professionals.map((professional) => (
                <div key={professional.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={professional.id}
                    checked={selectedProfessionals.includes(professional.id)}
                    onCheckedChange={() => handleProfessionalToggle(professional.id)}
                  />
                  <Label htmlFor={professional.id} className="text-sm font-normal">
                    {professional.name}
                    {professional.specialty && (
                      <span className="text-gray-500 ml-1">({professional.specialty})</span>
                    )}
                  </Label>
                </div>
              ))}
              {professionals.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum profissional ativo encontrado</p>
              )}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
