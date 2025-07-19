
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateTimeInput
        value={formData.start_time}
        onChange={(value) => onFieldChange('start_time', value)}
        currentValue={originalData && !fieldModified.start_time ? originalData.start_time : undefined}
      />
      
      <DurationInput
        value={formData.duration}
        onChange={(value) => onFieldChange('duration', value)}
        currentValue={originalData && !fieldModified.duration ? originalData.duration : undefined}
      />
    </div>
  );
}
