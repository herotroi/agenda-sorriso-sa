
import { useState } from 'react';
import { Calendar, CalendarDays, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: Date, endDate: Date, period?: { year: number; month?: number | 'all'; day?: number | null }) => void;
  selectedYear?: number;
}

export function DateRangeSelector({ onDateRangeChange, selectedYear }: DateRangeSelectorProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(selectedYear || currentYear);
  const [month, setMonth] = useState<number | 'all'>('all');
  const [day, setDay] = useState<number | null>(null);

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

  // Gerar lista de dias baseado no mês selecionado
  const getDaysInMonth = (selectedMonth: number | 'all', selectedYear: number) => {
    if (selectedMonth === 'all') return [];
    const daysCount = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysCount }, (_, i) => i + 1);
  };

  const days = month !== 'all' ? getDaysInMonth(month, year) : [];

  const handleApplyFilter = () => {
    let startDate: Date;
    let endDate: Date;

    if (day && month !== 'all') {
      // Dia específico
      startDate = new Date(year, month - 1, day, 0, 0, 0);
      endDate = new Date(year, month - 1, day, 23, 59, 59);
    } else if (month !== 'all') {
      // Mês específico
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      // Ano inteiro
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    onDateRangeChange(startDate, endDate, { year, month, day });
  };

  const handleClearFilter = () => {
    const currentYear = new Date().getFullYear();
    setYear(currentYear);
    setMonth('all');
    setDay(null);
    
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    onDateRangeChange(startDate, endDate, { year: currentYear, month: 'all', day: null });
  };

  const handleMonthChange = (value: string) => {
    const newMonth = value === 'all' ? 'all' : parseInt(value);
    setMonth(newMonth);
    setDay(null); // Reset day when month changes
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
            <Select value={month.toString()} onValueChange={handleMonthChange}>
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

          {month !== 'all' && days.length > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={day?.toString() || 'all_days'} onValueChange={(value) => setDay(value === 'all_days' ? null : parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Selecionar dia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_days">Todos os dias</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      Dia {d.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleApplyFilter} variant="outline" size="sm">
              Aplicar Filtro
            </Button>
            <Button onClick={handleClearFilter} variant="outline" size="sm">
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
