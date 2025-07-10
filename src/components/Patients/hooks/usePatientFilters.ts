
import { useState, useEffect } from 'react';
import { Patient } from '@/types/patient';

export function usePatientFilters(patients: Patient[]) {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    let filtered = patients.filter(patient => {
      const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf?.includes(searchTerm) ||
        patient.phone?.includes(searchTerm);
      
      const matchesStatus = showInactive ? true : patient.active !== false;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredPatients(filtered);
  }, [searchTerm, patients, showInactive]);

  return {
    filteredPatients,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
  };
}
