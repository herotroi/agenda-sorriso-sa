import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientRecordDetailsDialog } from './PatientRecordDetailsDialog';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

interface PatientRecordsListProps {
  records: PatientRecord[];
  onEditRecord: (record: PatientRecord) => void;
  loading: boolean;
}

export function PatientRecordsList({ records, onEditRecord, loading }: PatientRecordsListProps) {
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewRecord = (record: PatientRecord) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Registros do Prontuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Registros do Prontuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Nenhum registro encontrado</p>
            <p className="text-sm mt-1">Os registros do prontuário aparecerão aqui</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            <span className="truncate">Registros do Prontuário ({records.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-24rem)] max-h-[600px]">
            <div className="space-y-4 p-6 pt-0">
              {records.map((record) => (
                <div 
                  key={record.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {record.title || 'Consulta sem título'}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        {record.professionals && (
                          <div className="flex items-center gap-1 min-w-0">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">Dr(a). {record.professionals.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record);
                        }}
                        className="flex-shrink-0"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRecord(record);
                        }}
                        className="flex-shrink-0"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>

                  {record.appointments?.procedures && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {record.appointments.procedures.name}
                    </Badge>
                  )}

                  {(record.content || record.notes) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-700 line-clamp-3 break-words">
                        {record.content || record.notes}
                      </p>
                    </div>
                  )}

                  {record.prescription && (
                    <div>
                      <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                        Com receita médica
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <PatientRecordDetailsDialog
        record={selectedRecord}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </>
  );
}
