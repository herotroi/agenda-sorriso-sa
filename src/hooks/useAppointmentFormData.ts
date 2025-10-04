
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentFormData, Patient, Professional, Procedure, AppointmentStatus } from '@/types/appointment-form';

// Helper: format Date to 'YYYY-MM-DDTHH:mm' in LOCAL time (for datetime-local inputs)
const toLocalDateTimeString = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function useAppointmentFormData(
  isOpen: boolean,
  appointmentToEdit: any,
  selectedDate: Date,
  selectedProfessionalId?: string
) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([]);
  const [originalData, setOriginalData] = useState<AppointmentFormData | null>(null);
  const [fieldModified, setFieldModified] = useState<Record<string, boolean>>({});
  
  const initializedRef = useRef(false);
  const lastIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    professional_id: selectedProfessionalId || '',
    procedure_id: '',
    start_time: toLocalDateTimeString(selectedDate),
    end_time: '',
    duration: '60',
    notes: '',
    status_id: 1,
    is_blocked: false,
    payment_method: '',
    payment_status: ''
  });

  const handleFieldChange = (field: string, value: any) => {
    setFieldModified(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleProcedureChange = (procedureId: string) => {
    const procedure = procedures.find(p => p.id === procedureId);
    if (procedure) {
      setFormData(prev => ({
        ...prev,
        procedure_id: procedureId,
        duration: procedure.default_duration.toString(),
        // Limpar profissional selecionado ao trocar procedimento
        professional_id: ''
      }));
      handleFieldChange('procedure_id', procedureId);
      handleFieldChange('duration', procedure.default_duration.toString());
      handleFieldChange('professional_id', '');
    }
  };

  const getFinalFormData = () => {
    return formData;
  };

  const resetFieldModifications = () => {
    setFieldModified({});
  };

  const fetchData = async () => {
    if (!user) return;

    try {
      // Buscar dados em paralelo
      const [patientsRes, professionalsRes, proceduresRes, statusesRes, procedureProfessionalsRes] = await Promise.all([
        supabase.from('patients').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('professionals').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('procedures').select('*').eq('user_id', user.id).eq('active', true),
        supabase.from('appointment_statuses').select('*').eq('active', true),
        supabase.from('procedure_professionals')
          .select(`
            procedure_id,
            professional_id,
            professionals!inner(*)
          `)
          .eq('user_id', user.id)
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (proceduresRes.error) throw proceduresRes.error;
      if (statusesRes.error) throw statusesRes.error;
      if (procedureProfessionalsRes.error) throw procedureProfessionalsRes.error;

      setPatients(patientsRes.data || []);
      
      // Transform professionals data to match updated interface
      const transformedProfessionals = (professionalsRes.data || []).map(prof => ({
        ...prof,
        working_hours: prof.working_hours || { start: "08:00", end: "18:00" },
        break_times: Array.isArray(prof.break_times) 
          ? prof.break_times 
          : (typeof prof.break_times === 'string' ? JSON.parse(prof.break_times || '[]') : []),
        working_days: Array.isArray(prof.working_days)
          ? prof.working_days
          : (typeof prof.working_days === 'string' ? JSON.parse(prof.working_days || '[true,true,true,true,true,false,false]') : [true,true,true,true,true,false,false])
      }));
      
      setProfessionals(transformedProfessionals);

      // Associar profissionais aos procedimentos
      const proceduresWithProfessionals = (proceduresRes.data || []).map(procedure => {
        const associatedProfessionals = (procedureProfessionalsRes.data || [])
          .filter(pp => pp.procedure_id === procedure.id)
          .map(pp => {
            const prof = pp.professionals;
            if (!prof) return null;
            
            // Transform professional data to match interface
            return {
              ...prof,
              working_hours: prof.working_hours || { start: "08:00", end: "18:00" },
              break_times: Array.isArray(prof.break_times) 
                ? prof.break_times 
                : (typeof prof.break_times === 'string' ? JSON.parse(prof.break_times || '[]') : []),
              working_days: Array.isArray(prof.working_days)
                ? prof.working_days
                : (typeof prof.working_days === 'string' ? JSON.parse(prof.working_days || '[true,true,true,true,true,false,false]') : [true,true,true,true,true,false,false])
            };
          })
          .filter(Boolean) as Professional[];
        
        return {
          ...procedure,
          professionals: associatedProfessionals
        };
      });

      setProcedures(proceduresWithProfessionals);
      setStatuses(statusesRes.data || []);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do formulário',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      lastIdRef.current = null;
      return;
    }

    if (appointmentToEdit) {
      // Initialize once per appointment being edited
      if (!initializedRef.current || lastIdRef.current !== appointmentToEdit.id) {
        const startDate = new Date(appointmentToEdit.start_time);
        const endDate = new Date(appointmentToEdit.end_time);
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)).toString();

        const editData: AppointmentFormData = {
          patient_id: appointmentToEdit.patient_id || '',
          professional_id: appointmentToEdit.professional_id || '',
          procedure_id: appointmentToEdit.procedure_id || '',
          start_time: toLocalDateTimeString(startDate),
          end_time: toLocalDateTimeString(endDate),
          duration,
          notes: appointmentToEdit.notes || '',
          status_id: appointmentToEdit.status_id || 1,
          is_blocked: appointmentToEdit.is_blocked || false,
          payment_method: appointmentToEdit.payment_method || '',
          payment_status: appointmentToEdit.payment_status || ''
        };

        setFormData(editData);
        setOriginalData(editData);
        setFieldModified({});
        initializedRef.current = true;
        lastIdRef.current = appointmentToEdit.id;
      }
    } else {
      // New appointment - initialize only once when opening
      if (!initializedRef.current) {
        const startDate = selectedDate;
        const endDate = new Date(selectedDate);
        endDate.setMinutes(endDate.getMinutes() + 60);

        const newData: AppointmentFormData = {
          patient_id: '',
          professional_id: selectedProfessionalId || '',
          procedure_id: '',
          start_time: toLocalDateTimeString(startDate),
          end_time: toLocalDateTimeString(endDate),
          duration: '60',
          notes: '',
          status_id: 1,
          is_blocked: false,
          payment_method: '',
          payment_status: ''
        };

        setFormData(newData);
        setOriginalData(null);
        setFieldModified({});
        initializedRef.current = true;
        lastIdRef.current = null;
      }
    }
  }, [isOpen, appointmentToEdit?.id, selectedDate, selectedProfessionalId]);

  return {
    patients,
    professionals,
    procedures,
    statuses,
    formData,
    setFormData,
    handleProcedureChange,
    handleFieldChange,
    originalData,
    fieldModified,
    getFinalFormData,
    resetFieldModifications
  };
}
