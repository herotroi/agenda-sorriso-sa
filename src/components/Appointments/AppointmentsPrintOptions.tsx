
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Printer, Calendar, Filter, FileText, X } from 'lucide-react';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';
import { Appointment } from '@/types';

interface AppointmentsPrintOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  activeFilters: { statusId?: number; procedureId?: string };
  hasActiveFilters: boolean;
}

export function AppointmentsPrintOptions({
  isOpen,
  onClose,
  appointments,
  activeFilters,
  hasActiveFilters
}: AppointmentsPrintOptionsProps) {
  const [printType, setPrintType] = useState<'all' | 'filtered' | 'date'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { handlePrint } = usePrintReport();

  const handlePrintClick = () => {
    if (printType === 'all') {
      // Imprimir todos os agendamentos
      handlePrint('table');
    } else if (printType === 'filtered' && hasActiveFilters) {
      // Imprimir com filtros aplicados
      handlePrint('table', undefined, undefined, activeFilters);
    } else if (printType === 'date') {
      // Imprimir por data específica
      const dateObj = new Date(selectedDate + 'T00:00:00');
      handlePrint('table', dateObj);
    }
    onClose();
  };

  const getAppointmentsCount = () => {
    if (printType === 'all') {
      return 'todos os agendamentos';
    } else if (printType === 'filtered' && hasActiveFilters) {
      return `${appointments.length} agendamentos filtrados`;
    } else if (printType === 'date') {
      return `agendamentos do dia ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}`;
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Opções de Impressão
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={printType} onValueChange={(value: 'all' | 'filtered' | 'date') => setPrintType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Todos os agendamentos
              </Label>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="filtered" id="filtered" />
                <Label htmlFor="filtered" className="flex items-center gap-2 cursor-pointer">
                  <Filter className="h-4 w-4" />
                  Agendamentos filtrados ({appointments.length})
                </Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="date" id="date" />
              <Label htmlFor="date" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="h-4 w-4" />
                Por data específica
              </Label>
            </div>
          </RadioGroup>

          {printType === 'date' && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="print-date">Selecionar data:</Label>
              <Input
                id="print-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Será impresso:</strong> {getAppointmentsCount()}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handlePrintClick} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
