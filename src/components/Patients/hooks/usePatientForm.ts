
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  sus_card?: string;
  health_insurance?: string;
  birth_date?: string;
  notes?: string;
  active?: boolean;
}

interface PatientRecord {
  id: string;
  created_at: string;
  professionals: { name: string };
  appointments?: {
    procedures?: { name: string };
  };
}

export function usePatientForm(patient: Patient | null, isOpen: boolean) {
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    email: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    sus_card: '',
    health_insurance: '',
    birth_date: '',
    notes: '',
    active: true,
  });
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPatientRecords = async (patientId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select(`
          id,
          created_at,
          professionals(name),
          appointments(
            procedures(name)
          )
        `)
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatientRecords(data || []);
    } catch (error) {
      console.error('Error fetching patient records:', error);
    }
  };

  useEffect(() => {
    if (patient) {
      setFormData({
        full_name: patient.full_name || '',
        cpf: patient.cpf || '',
        phone: patient.phone || '',
        email: patient.email || '',
        street: patient.street || '',
        number: patient.number || '',
        neighborhood: patient.neighborhood || '',
        city: patient.city || '',
        state: patient.state || '',
        sus_card: patient.sus_card || '',
        health_insurance: patient.health_insurance || '',
        birth_date: patient.birth_date || '',
        notes: patient.notes || '',
        active: patient.active !== undefined ? patient.active : true,
      });
      fetchPatientRecords(patient.id);
    } else if (isOpen) {
      setFormData({
        full_name: '',
        cpf: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        sus_card: '',
        health_insurance: '',
        birth_date: '',
        notes: '',
        active: true,
      });
      setPatientRecords([]);
    }
  }, [patient, isOpen, user]);

  const handleSubmit = async (e: React.FormEvent, onClose: () => void) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);

    try {
      const data = {
        ...formData,
        birth_date: formData.birth_date || null,
        cpf: formData.cpf || null,
        phone: formData.phone || null,
        email: formData.email || null,
        street: formData.street || null,
        number: formData.number || null,
        neighborhood: formData.neighborhood || null,
        city: formData.city || null,
        state: formData.state || null,
        sus_card: formData.sus_card || null,
        health_insurance: formData.health_insurance || null,
        notes: formData.notes || null,
        user_id: user.id,
      };

      if (patient) {
        const { error } = await supabase
          .from('patients')
          .update(data)
          .eq('id', patient.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente atualizado com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('patients')
          .insert(data);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Paciente criado com sucesso',
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar paciente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    patientRecords,
    loading,
    handleSubmit,
  };
}
