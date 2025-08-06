
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, FolderOpen, Calendar, Download } from 'lucide-react';
import type { ProntuarioDocument } from '@/types/prontuario';

interface DocumentsOverviewProps {
  documents: ProntuarioDocument[];
}

export function DocumentsOverview({ documents }: DocumentsOverviewProps) {
  const handleDownload = (document: ProntuarioDocument) => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50/80 to-blue-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-blue-800">
                Documentos
              </CardTitle>
              <p className="text-sm text-blue-600 mt-1 font-medium">
                Arquivos e imagens do paciente
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1 text-sm font-semibold">
            {documents.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <FolderOpen className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-base font-medium">Nenhum documento encontrado</p>
              <p className="text-sm text-gray-400 mt-1">Faça upload de documentos na seção detalhada</p>
            </div>
          ) : (
            documents.slice(0, 6).map((document) => (
              <div 
                key={document.id} 
                className="group flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
                onClick={() => handleDownload(document)}
              >
                <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-gray-900 truncate mb-1">
                    {document.name}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(document.uploaded_at).toLocaleDateString('pt-BR')}
                    </div>
                    {document.file_size && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
                <Download className="h-4 w-4 text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
