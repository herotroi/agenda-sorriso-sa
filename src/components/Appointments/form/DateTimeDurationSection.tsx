
import { AppointmentFormData } from '@/types/appointment-form';
import { DateTimeInput } from './DateTimeInput';
import { DurationInput } from './DurationInput';

interface DateTimeDurationSectionProps {
  formData: AppointmentFormData;
  onFieldChange: (field: keyof AppointmentFormData, value: any) => void;
  originalData: AppointmentFormData | null;
  fieldModified: Record<string, boolean>;
}

export function DateTimeDurationSection({
  formData,
  onFieldChange,
  originalData,
  fieldModified
}: DateTimeDurationSectionProps) {
  const handleFieldChange = {
    startTime: (value: string) => onFieldChange('start_time', value),
    duration: (value: string) => onFieldChange('duration', value)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateTimeInput
        value={formData.start_time}
        onChange={handleFieldChange.startTime}
        currentValue={originalData?.start_time}
      />
      
      <DurationInput
        value={formData.duration}
        onChange={handleFieldChange.duration}
        currentValue={originalData?.duration}
      />
    </div>
  );
}
