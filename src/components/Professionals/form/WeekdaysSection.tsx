
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ShiftTimeSection } from './ShiftTimeSection';

interface WeekdaysSectionProps {
  workingDays: boolean[];
  weekendShiftActive: boolean;
  weekendShiftStart: string;
  weekendShiftEnd: string;
  onWorkingDaysChange: (days: boolean[]) => void;
  onWeekendShiftActiveChange: (active: boolean) => void;
  onWeekendShiftStartChange: (time: string) => void;
  onWeekendShiftEndChange: (time: string) => void;
}

const WEEKDAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

export function WeekdaysSection({
  workingDays,
  weekendShiftActive,
  weekendShiftStart,
  weekendShiftEnd,
  onWorkingDaysChange,
  onWeekendShiftActiveChange,
  onWeekendShiftStartChange,
  onWeekendShiftEndChange,
}: WeekdaysSectionProps) {
  const handleDayChange = (dayIndex: number, checked: boolean) => {
    const newWorkingDays = [...workingDays];
    newWorkingDays[dayIndex] = checked;
    onWorkingDaysChange(newWorkingDays);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dias de Trabalho</h3>
      
      {/* Dias da semana */}
      <div className="grid grid-cols-2 gap-3">
        {WEEKDAYS.map((day, index) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${index}`}
              checked={workingDays[index] || false}
              onCheckedChange={(checked) => handleDayChange(index, checked as boolean)}
            />
            <Label htmlFor={`day-${index}`} className="text-sm font-normal">
              {day}
            </Label>
          </div>
        ))}
      </div>

      {/* Expediente de fim de semana */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="weekend-shift"
            checked={weekendShiftActive}
            onCheckedChange={onWeekendShiftActiveChange}
          />
          <Label htmlFor="weekend-shift">Expediente específico para finais de semana</Label>
        </div>

        {weekendShiftActive && (
          <div className="ml-6">
            <ShiftTimeSection
              title="Expediente de Fim de Semana"
              startTime={weekendShiftStart}
              endTime={weekendShiftEnd}
              onStartTimeChange={onWeekendShiftStartChange}
              onEndTimeChange={onWeekendShiftEndChange}
              startId="weekend_shift_start"
              endId="weekend_shift_end"
            />
          </div>
        )}
      </div>
    </div>
  );
}
