
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Phone, Mail, User, FileText, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  sus_card?: string;
  health_insurance?: string;
  birth_date?: string;
  notes?: string;
}

interface PatientRecord {
  id: string;
  created_at: string;
  notes: string;
  prescription?: string;
  professionals: {
    name: string;
    specialty?: string;
  } | null;
  appointments: {
    procedures: {
      name: string;
    } | null;
  } | null;
}

interface AppointmentRecord {
  id: string;
  start_time: string;
  notes?: string;
  price?: number;
  procedures: {
    name: string;
  } | null;
  professionals: {
    name: string;
    specialty?: string;
  } | null;
}

interface PatientDetailsProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetails({ patient, isOpen, onClose }: PatientDetailsProps) {
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [appointmentRecords, setAppointmentRecords] = useState<AppointmentRecord[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchPatientHistory = async (patientId: string) => {
    setLoading(true);
    try {
      // Buscar registros de prontuário
      const { data: recordsData, error: recordsError } = await supabase
        .from('patient_records')
        .select(`
          id,
          created_at,
          notes,
          prescription,
          professionals(name, specialty),
          appointments(
            procedures(name)
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Buscar agendamentos do paciente
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          notes,
          price,
          procedures(name),
          professionals(name, specialty)
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      console.log('Registros encontrados:', recordsData);
      console.log('Agendamentos encontrados:', appointmentsData);

      setPatientRecords(recordsData || []);
      setAppointmentRecords(appointmentsData || []);

      // Calcular total gasto
      const total = (appointmentsData || []).reduce((sum, appointment) => {
        return sum + (appointment.price || 0);
      }, 0);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      setPatientRecords([]);
      setAppointmentRecords([]);
      setTotalSpent(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient && isOpen) {
      fetchPatientHistory(patient.id);
    }
  }, [patient, isOpen]);

  const formatAddress = (patient: Patient) => {
    const parts = [];
    if (patient.street) parts.push(patient.street);
    if (patient.number) parts.push(patient.number);
    if (patient.neighborhood) parts.push(patient.neighborhood);
    if (patient.city) parts.push(patient.city);
    if (patient.state) parts.push(patient.state);
    return parts.join(', ');
  };

  if (!patient) return null;

  const hasHistory = patientRecords.length > 0 || appointmentRecords.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Paciente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{patient.full_name}</h4>
                  {patient.cpf && (
                    <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>
                  )}
                  {patient.birth_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone}
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </div>
                  )}
                  {formatAddress(patient) && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 mt-0.5" />
                      {formatAddress(patient)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {patient.sus_card && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cartão SUS:</span>
                    <p className="text-sm text-gray-600">{patient.sus_card}</p>
                  </div>
                )}
                {patient.health_insurance && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Plano de Saúde:</span>
                    <p className="text-sm text-gray-600">{patient.health_insurance}</p>
                  </div>
                )}
              </div>

              {patient.notes && (
                <div className="pt-4 border-t">
                  <span className="text-sm font-medium text-gray-700">Observações:</span>
                  <p className="text-sm text-gray-600 mt-1">{patient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Gasto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Gasto na Clínica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalSpent.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Baseado em {appointmentRecords.length} procedimento(s) realizado(s)
              </p>
            </CardContent>
          </Card>

          {/* Histórico de Procedimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Procedimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando histórico...</div>
              ) : !hasHistory ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum procedimento registrado
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Registros de Prontuário */}
                  {patientRecords.map((record) => (
                    <div
                      key={`record-${record.id}`}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {new Date(record.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(record.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {record.appointments?.procedures?.name && (
                          <Badge variant="outline">
                            {record.appointments.procedures.name}
                          </Badge>
                        )}
                      </div>

                      {record.professionals && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Profissional: Dr(a). {record.professionals.name}
                          </span>
                          {record.professionals.specialty && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({record.professionals.specialty})
                            </span>
                          )}
                        </div>
                      )}

                      {record.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Notas:</span>
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                        </div>
                      )}

                      {record.prescription && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Prescrição:</span>
                          <p className="text-sm text-gray-600 mt-1">{record.prescription}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Agendamentos */}
                  {appointmentRecords.map((appointment) => (
                    <div
                      key={`appointment-${appointment.id}`}
                      className="border rounded-lg p-4 hover:bg-gray-50 bg-blue-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium">
                            {new Date(appointment.start_time).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(appointment.start_time).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {appointment.procedures?.name && (
                            <Badge variant="outline" className="bg-blue-100">
                              {appointment.procedures.name}
                            </Badge>
                          )}
                          {appointment.price && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              R$ {appointment.price.toFixed(2).replace('.', ',')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {appointment.professionals && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Profissional: Dr(a). {appointment.professionals.name}
                          </span>
                          {appointment.professionals.specialty && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({appointment.professionals.specialty})
                            </span>
                          )}
                        </div>
                      )}

                      {appointment.notes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Observações:</span>
                          <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Agendamento
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
