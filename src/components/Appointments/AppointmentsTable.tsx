
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit2, Save, X } from 'lucide-react';

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

export function AppointmentsTable() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
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

      setAppointments(appointmentsRes.data || []);
      setProfessionals(professionalsRes.data || []);
      setProcedures(proceduresRes.data || []);
      setStatuses(statusesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCellClick = (appointmentId: string, field: string, currentValue: string) => {
    setEditingCell({ appointmentId, field, value: currentValue });
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      const updateData: any = {};
      
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

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', editingCell.appointmentId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso',
      });

      // Atualizar a lista local
      await fetchData();
      setEditingCell(null);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar agendamento',
        variant: 'destructive',
      });
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave();
    } else if (e.key === 'Escape') {
      handleCellCancel();
    }
  };

  const renderEditableCell = (appointment: Appointment, field: string, displayValue: string, actualValue: string) => {
    const isEditing = editingCell?.appointmentId === appointment.id && editingCell?.field === field;

    if (isEditing) {
      if (field === 'professional_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => setEditingCell({ ...editingCell, value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'procedure_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => setEditingCell({ ...editingCell, value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
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
            <Button size="sm" onClick={handleCellSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'status_id') {
        return (
          <div className="flex items-center space-x-2">
            <Select
              value={editingCell.value}
              onValueChange={(value) => setEditingCell({ ...editingCell, value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel}>
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
            />
            <Button size="sm" onClick={handleCellSave}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCellCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
    }

    return (
      <div 
        className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() => handleCellClick(appointment.id, field, actualValue)}
      >
        <span>{displayValue}</span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Tabela de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  {appointment.patients?.full_name}
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
      </CardContent>
    </Card>
  );
}
