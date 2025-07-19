
import { AppointmentFormData } from '@/types/appointment-form';
import { DateTimeInput } from './DateTimeInput';
import { DurationInput } from './DurationInput';

interface DateTimeDurationSectionProps {
  formData: AppointmentFormData;
  handleFieldChange: {
    startTime: (value: string) => void;
    duration: (value: string) => void;
  };
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
