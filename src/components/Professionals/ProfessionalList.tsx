
import { useState } from 'react';
import { SubscriptionFooter } from '@/components/ui/subscription-footer';
import { ProfessionalGrid } from './components/ProfessionalGrid';
import { ProfessionalHeader } from './components/ProfessionalHeader';
import { ProfessionalForm } from './ProfessionalForm';
import { useProfessionalsData } from './hooks/useProfessionalsData';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

export function ProfessionalList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { professionals, loading, fetchProfessionals, deleteProfessional } = useProfessionalsData();
  const { subscriptionData, checkLimit, showLimitWarning } = useSubscriptionLimits();

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (professional.specialty && professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (professional: any) => {
    setEditingProfessional(professional);
    setIsFormOpen(true);
  };

  const handleDelete = async (professionalId: string) => {
    await deleteProfessional(professionalId);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProfessional(null);
    fetchProfessionals(); // Atualiza a lista após fechar o formulário
  };

  const handleUpdate = () => {
    fetchProfessionals(); // Atualiza a lista
  };

  // Contar apenas profissionais ativos
  const activeProfessionalsCount = professionals.filter(p => p.active !== false).length;
  const maxProfessionals = subscriptionData?.limits.max_professionals || 0;

  const handleAddClick = () => {
    // Verificar limite antes de adicionar novo profissional
    if (!checkLimit('professional')) {
      showLimitWarning('professional');
      return;
    }
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProfessionalHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        totalCount={professionals.length}
        filteredCount={filteredProfessionals.length}
      />

      {/* Badge de uso de profissionais */}
      {subscriptionData && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
            <span className="font-medium">
              {activeProfessionalsCount}/{maxProfessionals === 999999 ? '∞' : maxProfessionals}
            </span>
            <span className="text-muted-foreground">profissionais ativos</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando profissionais...</div>
      ) : (
        <ProfessionalGrid
          professionals={filteredProfessionals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      )}

      <ProfessionalForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        professional={editingProfessional}
      />

      {/* Subscription Footer */}
      {subscriptionData && (
        <SubscriptionFooter
          subscriptionData={subscriptionData}
          currentCount={activeProfessionalsCount}
          maxCount={subscriptionData.limits.max_professionals}
          featureName="Profissionais"
          canUseFeature={subscriptionData.canCreateProfessional}
        />
      )}
    </div>
  );
}
