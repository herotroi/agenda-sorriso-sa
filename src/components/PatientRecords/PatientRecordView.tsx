
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, User, Calendar, Pill } from 'lucide-react';

interface PatientRecord {
  id: string;
  notes: string;
  prescription?: string;
  created_at: string;
  professionals: { name: string };
}

interface PatientRecordViewProps {
  record: PatientRecord | null;
}

export function PatientRecordView({ record }: PatientRecordViewProps) {
  if (!record) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Detalhes da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Selecione uma consulta para ver os detalhes
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Detalhes da Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(record.created_at).toLocaleDateString('pt-BR')}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>{record.professionals?.name}</span>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Notas da Consulta</h4>
          <ScrollArea className="h-32 w-full border rounded p-3">
            <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
          </ScrollArea>
        </div>
        
        {record.prescription && (
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Pill className="h-4 w-4 mr-1" />
              Receita/Prescrição
            </h4>
            <ScrollArea className="h-32 w-full border rounded p-3">
              <p className="text-sm whitespace-pre-wrap">{record.prescription}</p>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
