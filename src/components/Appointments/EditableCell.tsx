
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
import { Appointment, EditingCell } from './types';

interface EditableCellProps {
  appointment: Appointment;
  field: string;
  displayValue: string;
  actualValue: string;
  editingCell: EditingCell | null;
  setEditingCell: React.Dispatch<React.SetStateAction<EditingCell | null>>;
  isUpdating: boolean;
  onCellClick: (appointmentId: string, field: string, currentValue: string) => void;
  onCellSave: () => void;
  onCellCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSelectChange: (field: string, newValue: string) => void;
  professionals: any[];
  procedures: any[];
  statuses: any[];
}

export function EditableCell({
  appointment,
  field,
  displayValue,
  actualValue,
  editingCell,
  setEditingCell,
  isUpdating,
  onCellClick,
  onCellSave,
  onCellCancel,
  onKeyDown,
  onSelectChange,
  professionals,
  procedures,
  statuses
}: EditableCellProps) {
  const isEditing = editingCell?.appointmentId === appointment.id && editingCell?.field === field;

  if (isEditing) {
    if (field === 'professional_id') {
      return (
        <div className="flex items-center space-x-2">
          <Select
            value={editingCell.value}
            onValueChange={(value) => onSelectChange(field, value)}
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
          <Button size="sm" onClick={onCellSave} disabled={isUpdating}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCellCancel} disabled={isUpdating}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    } else if (field === 'procedure_id') {
      return (
        <div className="flex items-center space-x-2">
          <Select
            value={editingCell.value}
            onValueChange={(value) => onSelectChange(field, value)}
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
          <Button size="sm" onClick={onCellSave} disabled={isUpdating}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCellCancel} disabled={isUpdating}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    } else if (field === 'status_id') {
      return (
        <div className="flex items-center space-x-2">
          <Select
            value={editingCell.value}
            onValueChange={(value) => onSelectChange(field, value)}
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
          <Button size="sm" onClick={onCellSave} disabled={isUpdating}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCellCancel} disabled={isUpdating}>
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
            onKeyDown={onKeyDown}
            className="h-8"
            autoFocus
            disabled={isUpdating}
          />
          <Button size="sm" onClick={onCellSave} disabled={isUpdating}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCellCancel} disabled={isUpdating}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
  }

  return (
    <div 
      className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-1 rounded min-h-[32px]"
      onClick={() => !isUpdating && onCellClick(appointment.id, field, actualValue)}
    >
      <span className="truncate">{displayValue}</span>
      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
