import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PatientRecordDetailsDialog } from './PatientRecordDetailsDialog';
import { PatientRecord } from '@/types/prontuario';
import { HtmlContent } from '@/components/ui/html-content';

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
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Registros ({records.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] sm:h-[500px] md:h-[calc(100vh-24rem)] max-h-[600px]">
            <div className="space-y-3 sm:space-y-4 p-3 sm:p-6 pt-0">
              {records.map((record) => (
                <div 
                  key={record.id} 
                  className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
                  <div className="flex flex-col gap-2 sm:gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2">
                        {record.title || 'Consulta sem título'}
                      </h4>
                      <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>
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
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord(record);
                        }}
                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                      >
                        <Eye className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRecord(record);
                        }}
                        className="flex-1 sm:flex-initial text-xs sm:text-sm"
                      >
                        <Edit className="h-3 w-3 sm:mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {record.appointments?.procedures && (
                      <Badge variant="secondary" className="text-xs">
                        {record.appointments.procedures.name}
                      </Badge>
                    )}
                    {(record as any).icd_code && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          (record as any).icd_version === 'CID-10' 
                            ? 'border-purple-300 text-purple-700 bg-purple-50' 
                            : 'border-blue-300 text-blue-700 bg-blue-50'
                        }`}
                      >
                        {(record as any).icd_code} - {(record as any).icd_version}
                      </Badge>
                    )}
                  </div>

                  {(record.content || record.notes) && (
                    <div className="mb-2">
                      <HtmlContent 
                        content={record.content || record.notes || ''} 
                        className="text-sm text-gray-700 line-clamp-3 break-words"
                      />
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
