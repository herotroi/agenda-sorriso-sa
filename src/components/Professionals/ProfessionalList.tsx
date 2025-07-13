
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfessionalForm } from './ProfessionalForm';
import { ProfessionalGrid } from './components/ProfessionalGrid';
import { ProfessionalHeader } from './components/ProfessionalHeader';
import { useProfessionalsData } from './hooks/useProfessionalsData';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import type { Professional } from '@/types';

export function ProfessionalList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const { 
    professionals, 
    loading, 
    deleteProfessional, 
    refreshProfessionals 
  } = useProfessionalsData();
  const { subscriptionData, checkLimit, showLimitWarning } = useSubscriptionLimits();

  const handleAddProfessional = () => {
    if (!checkLimit('professional')) {
      showLimitWarning('professional');
      return;
    }
    setEditingProfessional(null);
    setIsFormOpen(true);
  };

  const handleEditProfessional = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProfessional(null);
    refreshProfessionals();
  };

  const handleDeleteProfessional = async (professionalId: string, professionalName: string) => {
    if (professionals.length <= 1) {
      alert('Você deve manter pelo menos um profissional cadastrado.');
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir o profissional ${professionalName}?`)) {
      await deleteProfessional(professionalId);
    }
  };

  const canCreate = checkLimit('professional');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfessionalHeader 
        onAddProfessional={handleAddProfessional}
        canCreate={canCreate}
      />

      {subscriptionData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Plano Atual: {subscriptionData.hasAutomacao ? 'Ilimitado' : subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
              </p>
              <p className="text-sm text-blue-700">
                Profissionais: {subscriptionData.usage.professionals_count}
                {!subscriptionData.hasAutomacao && subscriptionData.limits.max_professionals !== -1 && ` / ${subscriptionData.limits.max_professionals}`}
              </p>
            </div>
            {!canCreate && !subscriptionData.hasAutomacao && (
              <div className="text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded">
                Limite atingido - Upgrade necessário para criar novos profissionais
              </div>
            )}
          </div>
        </div>
      )}

      <ProfessionalGrid
        professionals={professionals}
        onEdit={handleEditProfessional}
        onDelete={handleDeleteProfessional}
      />

      <ProfessionalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        professional={editingProfessional}
      />
    </div>
  );
}
