
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Eye } from 'lucide-react';
import type { Professional } from '@/types';
import { ProfessionalDetailViewHeader } from './ProfessionalDetailView/ProfessionalDetailViewHeader';
import { DayView } from './ProfessionalDetailView/DayView';
import { MonthView } from './ProfessionalDetailView/MonthView';
import { PrintButton } from './ProfessionalDetailView/PrintButton';
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
  
  const { appointments, monthAppointments, loading, handleAppointmentClick } = useProfessionalDetailData(
    professional.id,
    currentDate
  );

  // Ensure professional has required working_hours property
  const professionalWithDefaults = {
    ...professional,
    working_hours: professional.working_hours || { start: "08:00", end: "18:00" }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] overflow-hidden flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detalhes do Profissional - {professional.name}
              </div>
              <PrintButton 
                professional={professionalWithDefaults} 
                currentDate={currentDate} 
                view={view} 
              />
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-6">
          <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'month')} className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 space-y-4 pb-4">
              <ProfessionalDetailViewHeader
                professional={professionalWithDefaults}
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

            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="day" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-4">
                    <DayView
                      professional={professionalWithDefaults}
                      appointments={appointments}
                      currentDate={currentDate}
                      loading={loading}
                      onAppointmentClick={handleAppointmentClick}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="month" className="mt-0 h-full data-[state=active]:flex data-[state=active]:flex-col">
                <ScrollArea className="flex-1 h-full">
                  <div className="p-4">
                    <MonthView
                      professional={professionalWithDefaults}
                      appointments={monthAppointments}
                      selectedDate={currentDate}
                      onDateChange={setCurrentDate}
                      onAppointmentClick={handleAppointmentClick}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
