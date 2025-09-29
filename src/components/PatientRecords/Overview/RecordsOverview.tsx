
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Calendar, ArrowRight, FileText } from 'lucide-react';
import type { PatientRecord } from '@/types/prontuario';
import { HtmlContent } from '@/components/ui/html-content';

interface RecordsOverviewProps {
  records: PatientRecord[];
  onEditRecord: (record: PatientRecord) => void;
}

export function RecordsOverview({ records, onEditRecord }: RecordsOverviewProps) {
  return (
    <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4 bg-gradient-to-r from-orange-50/80 to-orange-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-xl shadow-sm">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-orange-800">
                Registros
              </CardTitle>
              <p className="text-sm text-orange-600 mt-1 font-medium">
                Anotações e prescrições médicas
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 px-3 py-1 text-sm font-semibold">
            {records.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <ClipboardList className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-base font-medium">Nenhum registro encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Crie um novo prontuário para adicionar registros</p>
            </div>
          ) : (
            records.slice(0, 6).map((record) => (
              <div 
                key={record.id} 
                className="group p-4 border-2 border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition-all duration-200"
                onClick={() => onEditRecord(record)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 truncate mb-1">
                        {record.title || 'Registro sem título'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-orange-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {record.content && (
                  <HtmlContent 
                    content={record.content} 
                    className="text-sm text-gray-600 line-clamp-2 mt-2"
                  />
                )}

                {record.appointments?.procedures?.name && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      {record.appointments.procedures.name}
                    </span>
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
