
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface BreakTime {
  start: string;
  end: string;
}

interface BreakTimesSectionProps {
  breakTimes: BreakTime[];
  onBreakTimesChange: (breakTimes: BreakTime[]) => void;
}

export function BreakTimesSection({ breakTimes, onBreakTimesChange }: BreakTimesSectionProps) {
  const addBreakTime = () => {
    onBreakTimesChange([...breakTimes, { start: '12:00', end: '13:00' }]);
  };

  const removeBreakTime = (index: number) => {
    const newBreakTimes = breakTimes.filter((_, i) => i !== index);
    onBreakTimesChange(newBreakTimes);
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    const newBreakTimes = breakTimes.map((breakTime, i) => 
      i === index ? { ...breakTime, [field]: value } : breakTime
    );
    onBreakTimesChange(newBreakTimes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Pausas/Intervalos</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBreakTime}
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Pausa
        </Button>
      </div>
      
      {breakTimes.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma pausa configurada</p>
      )}
      
      {breakTimes.map((breakTime, index) => (
        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-600">Início</Label>
              <Input
                type="time"
                value={breakTime.start}
                onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600">Fim</Label>
              <Input
                type="time"
                value={breakTime.end}
                onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeBreakTime(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
