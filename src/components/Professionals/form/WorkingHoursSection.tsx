
import { ShiftTimeSection } from './ShiftTimeSection';
import { BreakTimesSection } from './BreakTimesSection';
import { VacationSection } from './VacationSection';

interface WorkingHoursSectionProps {
  formData: {
    first_shift_start: string;
    first_shift_end: string;
    second_shift_start: string;
    second_shift_end: string;
    break_times: { start: string; end: string }[];
    vacation_active: boolean;
    vacation_start: string;
    vacation_end: string;
  };
  setFormData: (data: any) => void;
}

export function WorkingHoursSection({ formData, setFormData }: WorkingHoursSectionProps) {
  return (
    <div className="space-y-6">
      {/* Expediente */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Expediente</h3>
        <div className="grid grid-cols-2 gap-6">
          <ShiftTimeSection
            title="Primeiro Expediente"
            startTime={formData.first_shift_start}
            endTime={formData.first_shift_end}
            onStartTimeChange={(time) => setFormData({ ...formData, first_shift_start: time })}
            onEndTimeChange={(time) => setFormData({ ...formData, first_shift_end: time })}
            startId="first_shift_start"
            endId="first_shift_end"
          />
          <ShiftTimeSection
            title="Segundo Expediente"
            startTime={formData.second_shift_start}
            endTime={formData.second_shift_end}
            onStartTimeChange={(time) => setFormData({ ...formData, second_shift_start: time })}
            onEndTimeChange={(time) => setFormData({ ...formData, second_shift_end: time })}
            startId="second_shift_start"
            endId="second_shift_end"
          />
        </div>
      </div>

      {/* Pausas */}
      <div>
        <BreakTimesSection
          breakTimes={formData.break_times}
          onBreakTimesChange={(breakTimes) => setFormData({ ...formData, break_times: breakTimes })}
        />
      </div>

      {/* Férias */}
      <div>
        <VacationSection
          vacationActive={formData.vacation_active}
          vacationStart={formData.vacation_start}
          vacationEnd={formData.vacation_end}
          onVacationActiveChange={(active) => setFormData({ ...formData, vacation_active: active })}
          onVacationStartChange={(date) => setFormData({ ...formData, vacation_start: date })}
          onVacationEndChange={(date) => setFormData({ ...formData, vacation_end: date })}
        />
      </div>
    </div>
  );
}
