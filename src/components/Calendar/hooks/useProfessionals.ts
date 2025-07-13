
import { useState, useEffect } from 'react';
import { fetchProfessionals } from './utils/professionalUtils';
import { Professional } from '@/types';

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfessionals = async () => {
    try {
      const data = await fetchProfessionals();
      
      // Map database fields to frontend interface
      const mappedProfessionals: Professional[] = data.map(prof => ({
        id: prof.id,
        name: prof.name,
        specialty: prof.specialty || '',
        email: prof.email || '',
        phone: prof.phone || '',
        cro: prof.crm_cro || '',
        services: [],
        workingHours: {
          monday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          tuesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          wednesday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          thursday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          friday: { isWorking: true, startTime: '08:00', endTime: '18:00' },
          saturday: { isWorking: false, startTime: '08:00', endTime: '18:00' },
          sunday: { isWorking: false, startTime: '08:00', endTime: '18:00' }
        },
        calendarColor: prof.color || '#3b82f6',
        isActive: prof.active !== false,
        documents: [],
        createdAt: prof.created_at || new Date().toISOString(),
        // Include database fields for compatibility - ensure color is always present
        color: prof.color || '#3b82f6',
        working_hours: prof.working_hours,
        active: prof.active,
        crm_cro: prof.crm_cro,
        first_shift_start: prof.first_shift_start,
        first_shift_end: prof.first_shift_end,
        second_shift_start: prof.second_shift_start,
        second_shift_end: prof.second_shift_end,
        vacation_active: prof.vacation_active,
        vacation_start: prof.vacation_start,
        vacation_end: prof.vacation_end,
        break_times: prof.break_times,
        working_days: prof.working_days || [true, true, true, true, true, false, false],
        weekend_shift_active: prof.weekend_shift_active,
        weekend_shift_start: prof.weekend_shift_start,
        weekend_shift_end: prof.weekend_shift_end,
        updated_at: prof.updated_at,
        user_id: prof.user_id
      }));
      
      setProfessionals(mappedProfessionals);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  return {
    professionals,
    loading,
    refetch: loadProfessionals
  };
}
