
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
import { Separator } from '@/components/ui/separator';

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
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {patient ? 'Editar Paciente' : 'Novo Paciente'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => handleSubmit(e, onClose)} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dados Básicos</h3>
            <PatientBasicInfo
              formData={formData}
              setFormData={setFormData}
              applyCpfMask={applyCpfMask}
            />
          </div>

          <Separator />

          {/* Contato */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Contato</h3>
            <PatientContactInfo
              formData={formData}
              setFormData={setFormData}
              applyPhoneMask={applyPhoneMask}
            />
          </div>

          <Separator />

          {/* Endereço */}
          <PatientAddressInfo
            formData={formData}
            setFormData={setFormData}
            brazilianStates={brazilianStates}
          />

          <Separator />

          {/* Informações de Saúde */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Saúde</h3>
            <PatientHealthInfo
              formData={formData}
              setFormData={setFormData}
            />
          </div>

          <Separator />

          {/* Informações Adicionais */}
          <PatientAdditionalInfo
            formData={formData}
            setFormData={setFormData}
            applyCpfMask={applyCpfMask}
          />

          <Separator />

          {/* Status */}
          <PatientStatusToggle
            active={formData.active}
            onToggle={(active) => setFormData({ ...formData, active })}
          />

          {/* Histórico Médico */}
          {patient && (
            <>
              <Separator />
              <PatientMedicalHistory patientRecords={patientRecords} />
            </>
          )}

          <Separator />

          {/* Observações */}
          <PatientNotesSection
            formData={formData}
            setFormData={setFormData}
          />

          {/* Ações do formulário */}
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
