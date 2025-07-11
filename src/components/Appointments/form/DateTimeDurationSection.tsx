
import { AppointmentFormData } from '@/types/appointment-form';
import { DateTimeInput } from './DateTimeInput';
import { DurationInput } from './DurationInput';

interface DateTimeDurationSectionProps {
  formData: AppointmentFormData;
  handleFieldChange: (field: string, value: any) => void;
  originalData?: AppointmentFormData | null;
}

export function DateTimeDurationSection({
  formData,
  handleFieldChange,
  originalData
}: DateTimeDurationSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DateTimeInput
        value={formData.start_time}
        onChange={(value) => handleFieldChange('start_time', value)}
        currentValue={originalData?.start_time}
      />
      
      <DurationInput
        value={formData.duration}
        onChange={(value) => handleFieldChange('duration', value)}
        currentValue={originalData?.duration}
      />
    </div>
  );
}
