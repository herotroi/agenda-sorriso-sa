
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Mail, Phone, Trash2 } from 'lucide-react';
import { PatientForm } from './PatientForm';
import { PatientFilters } from './components/PatientFilters';
import { PatientListHeader } from './components/PatientListHeader';
import { PatientGrid } from './components/PatientGrid';
import { usePatientFilters } from './hooks/usePatientFilters';
import { usePatientData } from './hooks/usePatientData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  active: boolean;
  city?: string;
  state?: string;
}

export function PatientList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const { patients, loading, fetchPatients } = usePatientData();
  const { filteredPatients, filters, updateFilters, clearFilters } = usePatientFilters(patients);
  const { toast } = useToast();

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setIsFormOpen(true);
  };

  const handleDelete = async (patientId: string, patientName: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Paciente ${patientName} excluído com sucesso`,
      });
      
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir paciente',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPatient(null);
    fetchPatients();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <PatientListHeader 
        onAddPatient={() => setIsFormOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <PatientFilters 
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
      />

      {viewMode === 'grid' ? (
        <PatientGrid 
          patients={filteredPatients}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{patient.full_name}</h3>
                      <Badge variant={patient.active ? 'default' : 'secondary'}>
                        {patient.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {patient.cpf && (
                        <p className="text-sm text-gray-600">CPF: {patient.cpf}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {patient.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                      
                      {patient.birth_date && (
                        <p className="text-sm text-gray-600">
                          Data de nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      
                      {(patient.city || patient.state) && (
                        <p className="text-sm text-gray-600">
                          Localização: {[patient.city, patient.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o paciente <strong>{patient.full_name}</strong>? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(patient.id, patient.full_name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum paciente encontrado</p>
          </CardContent>
        </Card>
      )}

      <PatientForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        patient={editingPatient}
      />
    </div>
  );
}
