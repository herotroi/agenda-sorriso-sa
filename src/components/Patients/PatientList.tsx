
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientForm } from './PatientForm';
import { PatientTable } from './components/PatientTable';
import { usePatientData } from './hooks/usePatientData';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import type { Patient } from '@/types/patient';

export function PatientList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const { patients, loading, deletePatient, refreshPatients } = usePatientData();
  const { subscriptionData, checkLimit, showLimitWarning } = useSubscriptionLimits();

  const handleAddPatient = () => {
    if (!checkLimit('patient')) {
      showLimitWarning('patient');
      return;
    }
    setEditingPatient(null);
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    refreshPatients();
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente ${patient.full_name}?`)) {
      await deletePatient(patient.id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Gerencie os pacientes da sua clínica</p>
        </div>
        <Button onClick={handleAddPatient}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {subscriptionData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Plano Atual: {subscriptionData.hasAutomacao ? 'Ilimitado' : subscriptionData.plan_type.charAt(0).toUpperCase() + subscriptionData.plan_type.slice(1)}
              </p>
              <p className="text-sm text-blue-700">
                Pacientes: {subscriptionData.usage.patients_count}
                {!subscriptionData.hasAutomacao && subscriptionData.limits.max_patients !== -1 && ` / ${subscriptionData.limits.max_patients}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <PatientTable
        patients={patients}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />

      <PatientForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        patient={editingPatient}
      />
    </div>
  );
}
