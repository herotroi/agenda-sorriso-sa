
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Calendar } from 'lucide-react';
import { PatientRecordForm } from '@/components/PatientRecords/PatientRecordForm';
import { PatientRecordView } from '@/components/PatientRecords/PatientRecordView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  full_name: string;
}

interface PatientRecord {
  id: string;
  patient_id: string;
  professional_id: string;
  appointment_id?: string;
  notes: string;
  prescription?: string;
  files: any[];
  created_at: string;
  patients: { full_name: string };
  professionals: { name: string };
}

export default function Prontuario() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchRecords = async (patientId: string) => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select(`
          *,
          patients(full_name),
          professionals(name)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Convert the data to match our PatientRecord interface
      const formattedRecords: PatientRecord[] = (data || []).map(record => ({
        ...record,
        files: Array.isArray(record.files) ? record.files : []
      }));
      
      setRecords(formattedRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar prontuários',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchRecords(selectedPatient);
    } else {
      setRecords([]);
    }
  }, [selectedPatient]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    if (selectedPatient) {
      fetchRecords(selectedPatient);
    }
  };

  const handleRecordClick = (record: PatientRecord) => {
    setSelectedRecord(record);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuário Eletrônico</h1>
          <p className="text-gray-600">Visualize e gerencie os prontuários dos pacientes</p>
        </div>
        {selectedPatient && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Selecionar Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Histórico de Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhuma consulta registrada
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm font-medium">
                            {new Date(record.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {record.professionals?.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {record.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <PatientRecordView record={selectedRecord} />
        </div>
      )}

      <PatientRecordForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patientId={selectedPatient}
      />
    </div>
  );
}
