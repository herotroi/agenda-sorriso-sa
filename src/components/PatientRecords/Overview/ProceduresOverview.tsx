
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Stethoscope, ArrowRight, Clock } from 'lucide-react';
import type { Appointment } from '@/types/prontuario';

interface ProceduresOverviewProps {
  appointments: Appointment[];
  selectedAppointment: string | null;
  onAppointmentSelect: (appointmentId: string) => void;
}

export function ProceduresOverview({ 
  appointments, 
  selectedAppointment, 
  onAppointmentSelect 
}: ProceduresOverviewProps) {
  return (
    <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4 bg-gradient-to-r from-green-50/80 to-green-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl shadow-sm">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-green-800">
                Procedimentos
              </CardTitle>
              <p className="text-sm text-green-600 mt-1 font-medium">
                Histórico de consultas e procedimentos
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 px-3 py-1 text-sm font-semibold">
            {appointments.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Stethoscope className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-base font-medium">Nenhum procedimento encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Os procedimentos aparecerão aqui quando criados</p>
            </div>
          ) : (
            appointments.slice(0, 6).map((appointment) => (
              <div 
                key={appointment.id}
                className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedAppointment === appointment.id 
                    ? 'bg-green-50 border-green-300 shadow-md ring-2 ring-green-100' 
                    : 'hover:bg-green-25 hover:border-green-200 border-gray-200 hover:shadow-sm'
                }`}
                onClick={() => onAppointmentSelect(appointment.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedAppointment === appointment.id ? 'bg-green-200' : 'bg-green-100 group-hover:bg-green-150'
                    }`}>
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate">
                        {appointment.procedures?.name || 'Procedimento não especificado'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
                        <Clock className="h-3 w-3 ml-2" />
                        {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  {selectedAppointment === appointment.id && (
                    <ArrowRight className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                
                {appointment.professionals?.name && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Dr(a). {appointment.professionals.name}</span>
                  </div>
                )}

                {appointment.price && (
                  <div className="text-sm font-semibold text-green-700">
                    R$ {appointment.price.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
