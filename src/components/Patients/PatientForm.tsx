
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PatientBasicInfo } from './form/PatientBasicInfo';
import { PatientContactInfo } from './form/PatientContactInfo';
import { PatientAddressInfo } from './form/PatientAddressInfo';
import { PatientHealthInfo } from './form/PatientHealthInfo';
import { PatientAdditionalInfo } from './form/PatientAdditionalInfo';
import { PatientMedicalHistory } from './form/PatientMedicalHistory';
import { PatientNotesSection } from './form/PatientNotesSection';
import { PatientStatusToggle } from './form/PatientStatusToggle';
import { PatientFormActions } from './form/PatientFormActions';
import { usePatientForm } from './hooks/usePatientForm';
import { applyCpfMask, applyPhoneMask } from './utils/inputMasks';
import { Patient } from '@/types/patient';

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PatientForm({ isOpen, onClose, patient }: PatientFormProps) {
  const {
    formData,
    setFormData,
    patientRecords,
    loading,
    handleSubmit,
  } = usePatientForm(patient, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e, onClose)} className="space-y-4">
          <PatientBasicInfo
            formData={formData}
            setFormData={setFormData}
            applyCpfMask={applyCpfMask}
          />

          <PatientContactInfo
            formData={formData}
            setFormData={setFormData}
            applyPhoneMask={applyPhoneMask}
          />

          <PatientAddressInfo
            formData={formData}
            setFormData={setFormData}
            brazilianStates={brazilianStates}
          />

          <PatientHealthInfo
            formData={formData}
            setFormData={setFormData}
          />

          <PatientAdditionalInfo
            formData={formData}
            setFormData={setFormData}
            applyCpfMask={applyCpfMask}
          />

          <PatientStatusToggle
            active={formData.active}
            onToggle={(active) => setFormData({ ...formData, active })}
          />

          {patient && (
            <PatientMedicalHistory patientRecords={patientRecords} />
          )}

          <PatientNotesSection
            formData={formData}
            setFormData={setFormData}
          />

          <PatientFormActions
            onClose={onClose}
            loading={loading}
            isFormValid={!!formData.full_name}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
