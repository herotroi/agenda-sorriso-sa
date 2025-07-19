
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Eye } from 'lucide-react';
import type { Professional } from '@/types';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { useProfessionalDetailData } from './ProfessionalDetailView/hooks/useProfessionalDetailData';

interface ProfessionalDetailViewProps {
  professional: Professional;
  selectedDate: Date;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfessionalDetailView({
  professional,
  selectedDate: initialDate,
  isOpen,
  onClose
}: ProfessionalDetailViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<'day' | 'month'>('day');
  
  const { appointments, loading, handleAppointmentClick } = useProfessionalDetailData(
    professional.id,
    currentDate,
    view
  );

  // Ensure professional has required working_hours property
  const professionalWithDefaults = {
    ...professional,
    working_hours: professional.working_hours || { start: "08:00", end: "18:00" }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes do Profissional - {professional.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'month')} className="flex-1 flex flex-col">
            <div className="flex-shrink-0 space-y-4">
              <ProfessionalDetailViewHeader
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onNewAppointment={() => {}}
                view={view}
              />
              
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="day" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Visão Diária
                </TabsTrigger>
                <TabsTrigger value="month" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Visão Mensal
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="day" className="mt-4">
                <DayView
                  professional={professionalWithDefaults}
                  appointments={appointments}
                  selectedDate={currentDate}
                  loading={loading}
                  onAppointmentClick={handleAppointmentClick}
                />
              </TabsContent>
              
              <TabsContent value="month" className="mt-4">
                <MonthView
                  professional={professionalWithDefaults}
                  appointments={appointments}
                  selectedDate={currentDate}
                  onDateChange={setCurrentDate}
                  loading={loading}
                  onAppointmentClick={handleAppointmentClick}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
