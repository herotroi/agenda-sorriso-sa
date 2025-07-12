
import { useState } from 'react';
import { PatientListHeader } from './components/PatientListHeader';
import { PatientFilters } from './components/PatientFilters';
import { PatientGrid } from './components/PatientGrid';
import { PatientForm } from './PatientForm';
import { PatientDetails } from './PatientDetails';
import { usePatientData } from './hooks/usePatientData';
import { usePatientFilters } from './hooks/usePatientFilters';
import { usePatientFormState } from './hooks/usePatientFormState';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types/patient';

export function PatientList() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const { patients, loading, refetchPatients } = usePatientData();
  const { 
    filteredPatients, 
    searchTerm, 
    setSearchTerm, 
    showInactive, 
    setShowInactive 
  } = usePatientFilters(patients);

  const {
    isFormOpen,
    editingPatient,
    openForm,
    closeForm
  } = usePatientFormState();

  const handleEditPatient = (patient: Patient) => {
    openForm(patient);
  };

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Paciente ${patientName} excluído com sucesso`,
      });
      
      refetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir paciente',
        variant: 'destructive',
      });
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <PatientListHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddPatient={() => openForm()}
      />

      <PatientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showInactive={showInactive}
        setShowInactive={setShowInactive}
      />

      <PatientGrid
        patients={filteredPatients}
        onEdit={handleEditPatient}
        onViewDetails={handleViewPatient}
        onDelete={handleDeletePatient}
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={closeForm}
        patient={editingPatient}
      />

      {selectedPatient && (
        <PatientDetails
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          patient={selectedPatient}
        />
      )}
    </div>
  );
}
