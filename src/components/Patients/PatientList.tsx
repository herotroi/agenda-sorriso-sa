
import { useState } from 'react';
import { PatientListHeader } from './components/PatientListHeader';
import { PatientFilters } from './components/PatientFilters';
import { PatientGrid } from './components/PatientGrid';
import { PatientForm } from './PatientForm';
import { PatientDetails } from './PatientDetails';
import { usePatientData } from './hooks/usePatientData';
import { usePatientFilters } from './hooks/usePatientFilters';
import { usePatientForm } from './hooks/usePatientForm';
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
    setIsFormOpen,
    editingPatient,
    openForm,
    closeForm
  } = usePatientForm();

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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        onView={handleViewPatient}
        onDelete={handleDeletePatient}
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={closeForm}
        patient={editingPatient}
        onSuccess={() => {
          closeForm();
          refetchPatients();
        }}
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
