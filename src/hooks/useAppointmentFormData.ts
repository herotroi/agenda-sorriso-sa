
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppointmentFormData, Patient, Professional, Procedure, AppointmentStatus } from '@/types/appointment-form';

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

  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: '',
    professional_id: selectedProfessionalId || '',
    procedure_id: '',
    start_time: selectedDate.toISOString().slice(0, 16),
    end_time: '',
    duration: '60',
    notes: '',
    status_id: 1,
    is_blocked: false
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
      
      // Transform professionals data to match interface with working_hours default
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
          .map(pp => pp.professionals)
          .filter(Boolean);
        
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
    if (appointmentToEdit) {
      const startTime = new Date(appointmentToEdit.start_time);
      const endTime = new Date(appointmentToEdit.end_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)).toString();
      
      const editData = {
        patient_id: appointmentToEdit.patient_id || '',
        professional_id: appointmentToEdit.professional_id || '',
        procedure_id: appointmentToEdit.procedure_id || '',
        start_time: startTime.toISOString().slice(0, 16),
        end_time: endTime.toISOString().slice(0, 16),
        duration: duration,
        notes: appointmentToEdit.notes || '',
        status_id: appointmentToEdit.status_id || 1,
        is_blocked: appointmentToEdit.is_blocked || false
      };
      setFormData(editData);
      setOriginalData(editData);
    } else {
      const startTime = selectedDate.toISOString().slice(0, 16);
      const endDate = new Date(selectedDate);
      endDate.setMinutes(endDate.getMinutes() + 60);
      const endTime = endDate.toISOString().slice(0, 16);
      
      const newData = {
        patient_id: '',
        professional_id: selectedProfessionalId || '',
        procedure_id: '',
        start_time: startTime,
        end_time: endTime,
        duration: '60',
        notes: '',
        status_id: 1,
        is_blocked: false
      };
      setFormData(newData);
      setOriginalData(null);
    }
    setFieldModified({});
  }, [appointmentToEdit, selectedDate, selectedProfessionalId, isOpen]);

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
