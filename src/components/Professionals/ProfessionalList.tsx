
import { useState } from 'react';
import { ProfessionalForm } from './ProfessionalForm';
import { ProfessionalHeader } from './components/ProfessionalHeader';
import { ProfessionalGrid } from './components/ProfessionalGrid';
import { useProfessionalsData } from './hooks/useProfessionalsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Professional } from './types';

export function ProfessionalList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const { toast } = useToast();

  const { professionals, loading, refetchProfessionals } = useProfessionalsData();

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsFormOpen(true);
  };

  const handleDelete = async (professionalId: string, professionalName: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Profissional ${professionalName} excluído com sucesso`,
      });
      
      refetchProfessionals();
    } catch (error) {
      console.error('Error deleting professional:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir profissional',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProfessional(null);
    refetchProfessionals();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfessionalHeader onAddProfessional={() => setIsFormOpen(true)} />

      <ProfessionalGrid
        professionals={professionals}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ProfessionalForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        professional={editingProfessional}
      />
    </div>
  );
}
