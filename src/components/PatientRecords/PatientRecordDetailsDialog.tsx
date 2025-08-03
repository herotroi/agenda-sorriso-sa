
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, User, Calendar, Pill, Printer, Download, MapPin, Phone } from 'lucide-react';
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
  patients?: {
    name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    address?: string;
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

    const currentDate = new Date();
    const printContent = `
      <html>
        <head>
          <title>Prontuário Médico - ${record.patients?.name || 'Paciente'}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { 
                margin: 2cm; 
                size: A4; 
              }
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
            }
            
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 0; 
              color: #000; 
              line-height: 1.6;
              font-size: 12pt;
            }
            
            .medical-header {
              text-align: center;
              margin-bottom: 30px;
              padding: 20px 0;
              border-bottom: 3px double #000;
            }
            
            .medical-header h1 {
              margin: 0;
              font-size: 18pt;
              font-weight: bold;
              color: #000;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            
            .medical-header .subtitle {
              margin: 5px 0 0 0;
              font-size: 12pt;
              color: #444;
              font-style: italic;
            }
            
            .document-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 25px;
              padding: 10px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
            }
            
            .document-number {
              font-weight: bold;
              font-size: 11pt;
            }
            
            .print-date {
              font-size: 10pt;
              color: #666;
            }
            
            .patient-info {
              margin-bottom: 25px;
              padding: 15px;
              border: 2px solid #000;
              background-color: #fafafa;
            }
            
            .patient-info h2 {
              margin: 0 0 15px 0;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
            }
            
            .patient-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            
            .patient-field {
              margin-bottom: 8px;
            }
            
            .field-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
              font-size: 11pt;
            }
            
            .field-value {
              font-size: 11pt;
            }
            
            .medical-section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            
            .section-header {
              background-color: #e9ecef;
              padding: 10px;
              margin-bottom: 10px;
              border-left: 5px solid #007bff;
              font-weight: bold;
              font-size: 12pt;
              text-transform: uppercase;
            }
            
            .section-content {
              padding: 15px;
              border: 1px solid #ddd;
              background-color: #fff;
              min-height: 80px;
              white-space: pre-wrap;
              font-size: 11pt;
              line-height: 1.8;
            }
            
            .prescription-section .section-content {
              border-left: 4px solid #28a745;
              background-color: #f8fff9;
            }
            
            .appointment-info {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            
            .appointment-info h3 {
              margin: 0 0 10px 0;
              font-size: 12pt;
              color: #856404;
            }
            
            .documents-section {
              margin-top: 30px;
            }
            
            .document-item {
              padding: 10px;
              border: 1px solid #ddd;
              margin-bottom: 8px;
              background-color: #f8f9fa;
            }
            
            .document-name {
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .signature-section {
              margin-top: 50px;
              page-break-inside: avoid;
            }
            
            .signature-box {
              border-top: 1px solid #000;
              width: 300px;
              margin: 40px auto 0;
              text-align: center;
              padding-top: 10px;
            }
            
            .signature-text {
              font-size: 10pt;
              color: #666;
            }
            
            .validity-note {
              margin-top: 30px;
              padding: 15px;
              background-color: #f0f8ff;
              border: 1px dashed #007bff;
              font-size: 10pt;
              text-align: center;
              color: #004085;
            }
            
            .medical-footer {
              margin-top: 40px;
              text-align: center;
              font-size: 9pt;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="medical-header">
            <h1>Prontuário Médico Odontológico</h1>
            <div class="subtitle">Registro Clínico do Paciente</div>
          </div>
          
          <div class="document-info">
            <div class="document-number">Documento Nº: ${record.id.substring(0, 8).toUpperCase()}</div>
            <div class="print-date">Impresso em: ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
          </div>
          
          <div class="patient-info">
            <h2>Dados do Paciente</h2>
            <div class="patient-details">
              <div class="patient-field">
                <span class="field-label">Nome:</span>
                <span class="field-value">${record.patients?.name || 'Não informado'}</span>
              </div>
              ${record.patients?.birth_date ? `
                <div class="patient-field">
                  <span class="field-label">Data Nasc.:</span>
                  <span class="field-value">${format(new Date(record.patients.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              ` : ''}
              ${record.patients?.email ? `
                <div class="patient-field">
                  <span class="field-label">Email:</span>
                  <span class="field-value">${record.patients.email}</span>
                </div>
              ` : ''}
              ${record.patients?.phone ? `
                <div class="patient-field">
                  <span class="field-label">Telefone:</span>
                  <span class="field-value">${record.patients.phone}</span>
                </div>
              ` : ''}
              ${record.patients?.address ? `
                <div class="patient-field" style="grid-column: 1 / -1;">
                  <span class="field-label">Endereço:</span>
                  <span class="field-value">${record.patients.address}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${record.appointments ? `
            <div class="appointment-info">
              <h3>Informações da Consulta</h3>
              <div><strong>Data:</strong> ${format(new Date(record.appointments.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
              ${record.appointments.procedures ? `<div><strong>Procedimento:</strong> ${record.appointments.procedures.name}</div>` : ''}
              ${record.professionals ? `<div><strong>Profissional:</strong> Dr(a). ${record.professionals.name}</div>` : ''}
            </div>
          ` : ''}
          
          ${record.content || record.notes ? `
            <div class="medical-section">
              <div class="section-header">Anamnese e Exame Clínico</div>
              <div class="section-content">${(record.content || record.notes || '').replace(/\n/g, '\n')}</div>
            </div>
          ` : ''}
          
          ${record.prescription ? `
            <div class="medical-section prescription-section">
              <div class="section-header">Prescrição Médica</div>
              <div class="section-content">${record.prescription.replace(/\n/g, '\n')}</div>
            </div>
          ` : ''}
          
          ${documents.length > 0 ? `
            <div class="documents-section">
              <div class="section-header">Documentos Anexados</div>
              ${documents.map(doc => `
                <div class="document-item">
                  <div class="document-name">${doc.name}</div>
                  ${doc.description ? `<div>Descrição: ${doc.description}</div>` : ''}
                  <div>Data de Upload: ${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-text">
                ${record.professionals ? `Dr(a). ${record.professionals.name}` : 'Assinatura do Profissional'}<br>
                CRO: _______________
              </div>
            </div>
          </div>
          
          <div class="validity-note">
            <strong>VALIDADE MÉDICA:</strong> Este documento tem validade legal e médica conforme estabelecido pelo Conselho Regional de Odontologia. 
            Documento gerado eletronicamente em ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}.
          </div>
          
          <div class="medical-footer">
            Sistema de Prontuário Eletrônico - Documento gerado automaticamente<br>
            Data do registro: ${format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
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
      <DialogContent className="sm:max-w-[1000px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-blue-600" />
              Prontuário Médico
            </DialogTitle>
            <Button onClick={handlePrint} variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Prontuário
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Coluna Esquerda - Informações Principais */}
          <div className="border-r border-gray-200">
            <ScrollArea className="h-[calc(95vh-100px)] px-6 py-4">
              <div className="space-y-6">
                {/* Informações do Paciente */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-800">
                    <User className="h-5 w-5" />
                    Dados do Paciente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Nome:</span>
                      <p className="mt-1 font-medium">{record.patients?.name || 'Não informado'}</p>
                    </div>
                    
                    {record.patients?.birth_date && (
                      <div>
                        <span className="font-medium text-gray-600">Data de Nascimento:</span>
                        <p className="mt-1">{format(new Date(record.patients.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                      </div>
                    )}
                    
                    {record.patients?.email && (
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="mt-1">{record.patients.email}</p>
                      </div>
                    )}
                    
                    {record.patients?.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div>
                          <span className="font-medium text-gray-600">Telefone:</span>
                          <p className="mt-1">{record.patients.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {record.patients?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-600" />
                        <div>
                          <span className="font-medium text-gray-600">Endereço:</span>
                          <p className="mt-1">{record.patients.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações da Consulta */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações da Consulta</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Título:</span>
                      <p className="mt-1">{record.title || 'Sem título'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Registrado em: {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
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

                    {record.appointments?.start_time && (
                      <div>
                        <span className="font-medium text-gray-600">Data da consulta:</span>
                        <p className="mt-1">{format(new Date(record.appointments.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anamnese e Exame */}
                {(record.content || record.notes) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Anamnese e Exame Clínico</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {record.content || record.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prescrição */}
                {record.prescription && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      Prescrição Médica
                    </h3>
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {record.prescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Coluna Direita - Documentos */}
          <div>
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold">Documentos Anexados</h3>
            </div>
            <ScrollArea className="h-[calc(95vh-140px)] px-6 py-4">
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Enviado em {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tamanho: {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        className="ml-3 flex-shrink-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum documento anexado</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
