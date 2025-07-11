
import { useState } from 'react';
import { Calendar, CalendarDays, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  selectedYear?: number;
}

export function DateRangeSelector({ onDateRangeChange, selectedYear }: DateRangeSelectorProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(selectedYear || currentYear);
  const [month, setMonth] = useState<number | 'all'>('all');

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 'all', label: 'Todos os meses' },
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const handleApplyFilter = () => {
    let startDate: Date;
    let endDate: Date;

    if (month === 'all') {
      // Ano inteiro
      startDate = new Date(year, 0, 1); // 1º de janeiro
      endDate = new Date(year, 11, 31, 23, 59, 59); // 31 de dezembro
    } else {
      // Mês específico
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59); // Último dia do mês
    }

    onDateRangeChange(startDate, endDate);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrar período:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={month.toString()} onValueChange={(value) => setMonth(value === 'all' ? 'all' : parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleApplyFilter} variant="outline" size="sm">
            Aplicar Filtro
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
