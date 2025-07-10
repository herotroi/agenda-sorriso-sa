
import { useState } from 'react';
import { PatientForm } from './PatientForm';
import { PatientDetails } from './PatientDetails';
import { PatientListHeader } from './components/PatientListHeader';
import { PatientFilters } from './components/PatientFilters';
import { PatientGrid } from './components/PatientGrid';
import { usePatientData } from './hooks/usePatientData';
import { usePatientFilters } from './hooks/usePatientFilters';
import { Patient } from '@/types/patient';

export function PatientList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { patients, loading, refetchPatients } = usePatientData();
  const {
    filteredPatients,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
  } = usePatientFilters(patients);

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    refetchPatients();
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedPatient(null);
  };

  const handleNewPatient = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PatientListHeader onNewPatient={handleNewPatient} />

      <PatientFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
      />

      <PatientGrid
        patients={filteredPatients}
        loading={loading}
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onViewDetails={handleViewDetails}
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patient={editingPatient}
      />

      <PatientDetails
        patient={selectedPatient}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
      />
    </div>
  );
}
