
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Edit2, Save, X, RefreshCw } from 'lucide-react';

interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string;
  procedure_id: string | null;
  start_time: string;
  end_time: string;
  status_id: number;
  notes: string | null;
  patients: { full_name: string };
  professionals: { name: string };
  procedures: { name: string } | null;
  appointment_statuses: { label: string; color: string };
}

interface EditingCell {
  appointmentId: string;
  field: string;
  value: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    console.log('🔄 Fetching appointments data...');
    setRefreshing(true);
    try {
      const [appointmentsRes, professionalsRes, proceduresRes, statusesRes] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            *,
            patients(full_name),
            professionals(name),
            procedures(name),
            appointment_statuses(label, color)
          `)
          .order('start_time', { ascending: false })
          .limit(50),
        supabase.from('professionals').select('*').eq('active', true),
        supabase.from('procedures').select('*').eq('active', true),
        supabase.from('appointment_statuses').select('*').eq('active', true)
      ]);

      if (appointmentsRes.error) throw appointmentsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;
      if (proceduresRes.error) throw proceduresRes.error;
      if (statusesRes.error) throw statusesRes.error;

      console.log('✅ Data fetched successfully:', {
        appointments: appointmentsRes.data?.length,
        professionals: professionalsRes.data?.length,
        procedures: proceduresRes.data?.length,
        statuses: statusesRes.data?.length
      });

      setAppointments(appointmentsRes.data || []);
      setProfessionals(professionalsRes.data || []);
      setProcedures(proceduresRes.data || []);
      setStatuses(statusesRes.data || []);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carrega dados apenas uma vez na inicialização
  useEffect(() => {
    fetchData();
  }, []); // Removido qualquer dependência que causava re-fetch automático

  const validateFieldValue = (field: string, value: string): ValidationResult => {
    console.log(`🔍 Validating field ${field} with value:`, value);

    switch (field) {
      case 'professional_id':
        const professionalExists = professionals.find(p => p.id === value);
        if (!professionalExists) {
          return { isValid: false, error: 'Profissional não encontrado' };
        }
        break;
      
      case 'procedure_id':
        if (value && value !== '') {
          const procedureExists = procedures.find(p => p.id === value);
          if (!procedureExists) {
            return { isValid: false, error: 'Procedimento não encontrado' };
          }
        }
        break;
      
      case 'status_id':
        const statusId = parseInt(value);
        if (isNaN(statusId)) {
          return { isValid: false, error: 'Status inválido' };
        }
        const statusExists = statuses.find(s => s.id === statusId);
        if (!statusExists) {
          return { isValid: false, error: 'Status não encontrado' };
        }
        break;
      
      case 'start_time':
        const startDate = new Date(value);
        if (isNaN(startDate.getTime())) {
          return { isValid: false, error: 'Data/hora inválida' };
        }
        if (startDate < new Date()) {
          return { isValid: false, error: 'Não é possível agendar para o passado' };
        }
        break;
    }

    return { isValid: true };
  };

  const handleCellClick = (appointmentId: string, field: string, currentValue: string) => {
    console.log(`📝 Starting edit for appointment ${appointmentId}, field ${field}, current value:`, currentValue);
    setEditingCell({ appointmentId, field, value: currentValue });
  };

  const handleCellSave = async () => {
    if (!editingCell || isUpdating) {
      console.log('⚠️ Cannot save: no editing cell or already updating');
      return;
    }

    console.log('💾 Starting save process for:', editingCell);
    setIsUpdating(true);

    try {
      // Validate the new value
      const validation = validateFieldValue(editingCell.field, editingCell.value);
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.error);
        toast({
          title: 'Erro de Validação',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      if (editingCell.field === 'start_time') {
        const startTime = new Date(editingCell.value);
        const appointment = appointments.find(a => a.id === editingCell.appointmentId);
        if (appointment) {
          const currentEndTime = new Date(appointment.end_time);
          const currentStartTime = new Date(appointment.start_time);
          const duration = currentEndTime.getTime() - currentStartTime.getTime();
          const newEndTime = new Date(startTime.getTime() + duration);
          
          updateData.start_time = startTime.toISOString();
          updateData.end_time = newEndTime.toISOString();
        }
      } else if (editingCell.field === 'professional_id') {
        updateData.professional_id = editingCell.value;
      } else if (editingCell.field === 'procedure_id') {
        updateData.procedure_id = editingCell.value || null;
      } else if (editingCell.field === 'status_id') {
        updateData.status_id = parseInt(editingCell.value);
      } else if (editingCell.field === 'notes') {
        updateData.notes = editingCell.value || null;
      }

      console.log('📤 Sending update to Supabase:', {
        appointmentId: editingCell.appointmentId,
        updateData
      });

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', editingCell.appointmentId)
        .select(`
          *,
          patients(full_name),
          professionals(name),
          procedures(name),
          appointment_statuses(label, color)
        `);

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Update successful, updated data:', data);

      // Update local state with the returned data
      if (data && data[0]) {
        setAppointments(prev => prev.map(appointment => 
          appointment.id === editingCell.appointmentId 
            ? { ...appointment, ...data[0] }
            : appointment
        ));
      }

      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso',
      });

      setEditingCell(null);
    } catch (error: any) {
      console.error('❌ Error updating appointment:', error);
      
      let errorMessage = 'Erro ao atualizar agendamento';
      
      if (error.code === '23503') {
        errorMessage = 'Erro de referência: verifique se os dados selecionados existem';
      } else if (error.code === '23505') {
        errorMessage = 'Conflito de dados: já existe um registro similar';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCellCancel = () => {
    console.log('❌ Cancelling edit');
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const handleSelectChange = (field: string, newValue: string) => {
    console.log(`🔄 Select changed for field ${field} to:`, newValue);
    if (editingCell) {
      setEditingCell({ ...editingCell, value: newValue });
    }
  };

  const handleManualRefresh = () => {
    fetchData();
  };

  const renderEditableCell = (appointment: Appointment, field: string, displayValue: string, actualValue: string) => {
    const isEditing = editingCell?.appointmentId === appointment.id && editingCell?.field === field;

    if (isEditing) {
      if (field === 'professional_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => handleSelectChange(field, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave} disabled={isUpdating}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel} disabled={isUpdating}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'procedure_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => handleSelectChange(field, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione um procedimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {procedures.map((proc) => (
                  <SelectItem key={proc.id} value={proc.id}>
                    {proc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave} disabled={isUpdating}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel} disabled={isUpdating}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'status_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => handleSelectChange(field, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave} disabled={isUpdating}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel} disabled={isUpdating}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2">
            <Input
              type={field === 'start_time' ? 'datetime-local' : 'text'}
              value={editingCell.value}
              onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
              onKeyDown={handleKeyDown}
              className="h-8"
              autoFocus
              disabled={isUpdating}
            />
            <Button size="sm" onClick={handleCellSave} disabled={isUpdating}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel} disabled={isUpdating}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
    }

    return (
      <div 
        className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[32px]"
        onClick={() => !isUpdating && handleCellClick(appointment.id, field, actualValue)}
      >
        <span className="truncate">{displayValue}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p>Carregando agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tabela de Agendamentos
            {isUpdating && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Salvando...
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum agendamento encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Procedimento</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {appointment.patients?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        appointment,
                        'professional_id',
                        appointment.professionals?.name || 'N/A',
                        appointment.professional_id
                      )}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        appointment,
                        'procedure_id',
                        appointment.procedures?.name || 'Nenhum',
                        appointment.procedure_id || ''
                      )}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        appointment,
                        'start_time',
                        new Date(appointment.start_time).toLocaleString('pt-BR'),
                        new Date(appointment.start_time).toISOString().slice(0, 16)
                      )}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        appointment,
                        'status_id',
                        appointment.appointment_statuses?.label || 'N/A',
                        appointment.status_id.toString()
                      )}
                    </TableCell>
                    <TableCell>
                      {renderEditableCell(
                        appointment,
                        'notes',
                        appointment.notes || 'Sem observações',
                        appointment.notes || ''
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
