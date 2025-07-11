
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShiftTimeSectionProps {
  title: string;
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  startId: string;
  endId: string;
}

export function ShiftTimeSection({
  title,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  startId,
  endId,
}: ShiftTimeSectionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={startId} className="text-xs text-gray-600">Início</Label>
          <Input
            id={startId}
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={endId} className="text-xs text-gray-600">Fim</Label>
          <Input
            id={endId}
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
