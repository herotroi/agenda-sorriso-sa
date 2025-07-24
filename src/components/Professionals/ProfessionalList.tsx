
import { useState } from 'react';
import { ProfessionalGrid } from './components/ProfessionalGrid';
import { ProfessionalHeader } from './components/ProfessionalHeader';
import { ProfessionalForm } from './ProfessionalForm';
import { useProfessionalsData } from './hooks/useProfessionalsData';

export function ProfessionalList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { professionals, loading, fetchProfessionals, deleteProfessional } = useProfessionalsData();

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

  return (
    <div className="space-y-6">
      <ProfessionalHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsFormOpen(true)}
        totalCount={professionals.length}
        filteredCount={filteredProfessionals.length}
      />

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
    </div>
  );
}
