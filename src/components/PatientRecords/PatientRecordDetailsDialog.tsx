
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Calendar, Pill, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PatientRecord {
  id: string;
  title?: string;
  content?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
  professionals?: { name: string };
  appointments?: { 
    start_time: string;
    procedures?: { name: string };
  };
}

interface RecordDocument {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

interface PatientRecordDetailsDialogProps {
  record: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientRecordDetailsDialog({ record, isOpen, onClose }: PatientRecordDetailsDialogProps) {
  const [documents, setDocuments] = useState<RecordDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = async (recordId: string) => {
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from('prontuario_documents')
        .select('*')
        .eq('record_id', recordId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handlePrint = () => {
    if (!record) return;

    const printContent = `
      <html>
        <head>
          <title>Prontuário - ${record.title || 'Registro'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            .info-row { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .content { margin-top: 10px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #2563eb; }
            .prescription { background-color: #f0fdf4; border-left-color: #10b981; }
            .documents { margin-top: 20px; }
            .document-item { padding: 8px; border: 1px solid #e5e7eb; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>Prontuário Eletrônico</h1>
          
          <h2>Informações Gerais</h2>
          <div class="info-row"><span class="label">Título:</span> ${record.title || 'Sem título'}</div>
          <div class="info-row"><span class="label">Data:</span> ${format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
          ${record.professionals ? `<div class="info-row"><span class="label">Profissional:</span> Dr(a). ${record.professionals.name}</div>` : ''}
          ${record.appointments?.procedures ? `<div class="info-row"><span class="label">Procedimento:</span> ${record.appointments.procedures.name}</div>` : ''}
          
          ${record.content || record.notes ? `
            <h2>Notas da Consulta</h2>
            <div class="content">${(record.content || record.notes || '').replace(/\n/g, '<br>')}</div>
          ` : ''}
          
          ${record.prescription ? `
            <h2>Receita/Prescrição</h2>
            <div class="content prescription">${record.prescription.replace(/\n/g, '<br>')}</div>
          ` : ''}
          
          ${documents.length > 0 ? `
            <h2>Documentos Anexados</h2>
            <div class="documents">
              ${documents.map(doc => `
                <div class="document-item">
                  <strong>${doc.name}</strong>
                  ${doc.description ? `<br>Descrição: ${doc.description}` : ''}
                  <br>Data: ${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadDocument = async (doc: RecordDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao baixar documento',
        variant: 'destructive',
      });
    }
  };

  // Fetch documents when record changes
  useEffect(() => {
    if (record?.id && isOpen) {
      fetchDocuments(record.id);
    }
  }, [record?.id, isOpen]);

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes do Prontuário
            </DialogTitle>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Informações Gerais</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-600">Título:</span>
                  <p className="mt-1">{record.title || 'Sem título'}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                </div>

                {record.professionals && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Dr(a). {record.professionals.name}</span>
                  </div>
                )}

                {record.appointments?.procedures && (
                  <Badge variant="secondary" className="w-fit">
                    {record.appointments.procedures.name}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Content/Notes */}
            {(record.content || record.notes) && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Notas da Consulta</h3>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <p className="whitespace-pre-wrap text-sm">
                    {record.content || record.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Prescription */}
            {record.prescription && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-green-600" />
                  Receita/Prescrição
                </h3>
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="whitespace-pre-wrap text-sm">
                    {record.prescription}
                  </p>
                </div>
              </div>
            )}

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Documentos Anexados</h3>
              {loadingDocs ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        className="ml-3"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum documento anexado</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
