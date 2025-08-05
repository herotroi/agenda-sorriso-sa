import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, User, Calendar, Pill, Printer, Download, MapPin, Phone, Eye, IdCard, Mail, Users, Home } from 'lucide-react';
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
  patient_id?: string;
  professional_id?: string;
  appointment_id?: string;
  user_id: string;
}

interface Patient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cpf?: string;
  gender?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  profession?: string;
  marital_status?: string;
  sus_card?: string;
  health_insurance?: string;
}

interface Professional {
  id: string;
  name: string;
  specialty?: string;
  crm_cro?: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time?: string;
  procedures?: { name: string };
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
  const [patient, setPatient] = useState<Patient | null>(null);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<RecordDocument | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const { toast } = useToast();

  const fetchRecordData = async (recordData: PatientRecord) => {
    setLoadingData(true);
    try {
      // Buscar dados do paciente
      if (recordData.patient_id) {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', recordData.patient_id)
          .single();

        if (patientError) throw patientError;
        setPatient(patientData);
      }

      // Buscar dados do profissional
      if (recordData.professional_id) {
        const { data: professionalData, error: professionalError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', recordData.professional_id)
          .single();

        if (professionalError) throw professionalError;
        setProfessional(professionalData);
      }

      // Buscar dados do agendamento
      if (recordData.appointment_id) {
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            procedures(name)
          `)
          .eq('id', recordData.appointment_id)
          .single();

        if (appointmentError) throw appointmentError;
        setAppointment(appointmentData);
      }
    } catch (error) {
      console.error('Error fetching record data:', error);
    } finally {
      setLoadingData(false);
    }
  };

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

  const handlePrint = async () => {
    if (!record) return;

    const currentDate = new Date();
    const patientAddress = patient ? [
      patient.street,
      patient.number,
      patient.neighborhood,
      patient.city,
      patient.state
    ].filter(Boolean).join(', ') : '';

    // Buscar e incorporar documentos selecionados
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    let documentsEmbedHtml = '';

    if (selectedDocs.length > 0) {
      const documentPromises = selectedDocs.map(async (doc) => {
        const docUrl = getDocumentPreviewUrl(doc);
        
        if (doc.mime_type.startsWith('image/')) {
          return `
            <div class="document-embed page-break">
              <div class="document-header">
                <h4>${doc.name}</h4>
                ${doc.description ? `<p class="document-description">${doc.description}</p>` : ''}
                <div class="document-meta">
                  Upload: ${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} | 
                  Tamanho: ${(doc.file_size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div class="document-content">
                <img src="${docUrl}" alt="${doc.name}" class="document-image-full" />
              </div>
            </div>
          `;
        } else if (doc.mime_type === 'application/pdf') {
          // Para PDFs, vamos tentar incorporar como imagem ou mostrar aviso
          return `
            <div class="document-embed page-break">
              <div class="document-header">
                <h4>${doc.name}</h4>
                ${doc.description ? `<p class="document-description">${doc.description}</p>` : ''}
                <div class="document-meta">
                  Upload: ${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} | 
                  Tamanho: ${(doc.file_size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div class="document-content pdf-placeholder">
                <div class="pdf-info">
                  <div class="pdf-icon">📄</div>
                  <h5>Documento PDF: ${doc.name}</h5>
                  <p>Para visualizar o PDF completo, acesse: ${docUrl}</p>
                  <p class="pdf-note">Este documento será impresso em página separada.</p>
                </div>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="document-embed">
              <div class="document-header">
                <h4>${doc.name}</h4>
                ${doc.description ? `<p class="document-description">${doc.description}</p>` : ''}
                <div class="document-meta">
                  Tipo: ${doc.mime_type} | Upload: ${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })} | 
                  Tamanho: ${(doc.file_size / 1024).toFixed(1)} KB
                </div>
              </div>
              <div class="document-content file-placeholder">
                <div class="file-info">
                  <p><strong>Arquivo:</strong> ${doc.name}</p>
                  <p><strong>Tipo:</strong> ${doc.mime_type}</p>
                  <p><strong>Acesso:</strong> ${docUrl}</p>
                </div>
              </div>
            </div>
          `;
        }
      });

      const resolvedDocuments = await Promise.all(documentPromises);
      
      documentsEmbedHtml = `
        <div class="documents-section">
          <h3 class="section-title">Documentos Anexados (${selectedDocs.length})</h3>
          ${resolvedDocuments.join('')}
        </div>
      `;
    }

    const printContent = `
      <html>
        <head>
          <title>Prontuário Médico - ${patient?.full_name || 'Paciente'}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { 
                margin: 12mm 8mm; 
                size: A4 portrait;
              }
              
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
                margin: 0;
                padding: 0;
              }
              
              .page-break {
                page-break-before: always !important;
                page-break-inside: avoid !important;
              }
              
              .page-break:first-child {
                page-break-before: auto !important;
              }
              
              .document-image-full {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: none !important;
                object-fit: contain !important;
                display: block !important;
                margin: 0 auto !important;
                border: none !important;
                box-shadow: none !important;
              }
              
              .document-content {
                width: 100% !important;
                overflow: visible !important;
                page-break-inside: avoid !important;
              }
              
              .document-embed {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                overflow: visible !important;
              }
              
              .document-header {
                margin-bottom: 15px !important;
                padding: 10px 0 !important;
                border-bottom: 1px solid #ccc !important;
                page-break-after: avoid !important;
              }
              
              .pdf-placeholder,
              .file-placeholder {
                border: 2px dashed #ccc !important;
                padding: 30px !important;
                text-align: center !important;
                background-color: #f9f9f9 !important;
                border-radius: 8px !important;
                margin: 20px 0 !important;
              }
              
              .pdf-icon {
                font-size: 48px !important;
                margin-bottom: 15px !important;
              }
              
              .pdf-info h5 {
                font-size: 16pt !important;
                margin: 10px 0 !important;
                color: #333 !important;
              }
              
              .pdf-info p {
                font-size: 11pt !important;
                color: #666 !important;
                margin: 8px 0 !important;
              }
              
              .pdf-note {
                font-weight: bold !important;
                color: #2563eb !important;
              }
              
              /* Remover espaços em branco desnecessários */
              .medical-section,
              .patient-info,
              .appointment-info {
                page-break-inside: avoid !important;
                margin-bottom: 15px !important;
              }
              
              .signature-section {
                page-break-before: avoid !important;
                margin-top: 30px !important;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #000;
              line-height: 1.4;
              font-size: 11pt;
            }
            
            .medical-header {
              text-align: center;
              margin-bottom: 20px;
              padding: 15px 0;
              border-bottom: 2px solid #000;
            }
            
            .medical-header h1 {
              margin: 0 0 8px 0;
              font-size: 20pt;
              font-weight: bold;
              color: #000;
              text-transform: uppercase;
            }
            
            .medical-header .subtitle {
              margin: 0;
              font-size: 12pt;
              color: #555;
            }
            
            .document-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 8px;
              background-color: #f5f5f5;
              border: 1px solid #ccc;
              font-size: 10pt;
            }
            
            .patient-info {
              margin-bottom: 20px;
              border: 2px solid #000;
              background-color: #fafafa;
            }
            
            .patient-info h2 {
              margin: 0;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              background-color: #e0e0e0;
              padding: 10px;
              border-bottom: 1px solid #000;
              text-align: center;
            }
            
            .patient-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 0;
              padding: 0;
            }
            
            .patient-field {
              padding: 6px 12px;
              border-right: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
              font-size: 10pt;
              min-height: 20px;
              display: flex;
              align-items: center;
            }
            
            .patient-field:nth-child(even) {
              border-right: none;
            }
            
            .patient-field.full-width {
              grid-column: 1 / -1;
              border-right: none;
            }
            
            .field-label {
              font-weight: bold;
              min-width: 100px;
              margin-right: 8px;
              color: #333;
            }
            
            .field-value {
              flex: 1;
            }
            
            .medical-section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .section-header {
              background-color: #e9ecef;
              padding: 10px;
              margin-bottom: 10px;
              border-left: 4px solid #007bff;
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
              line-height: 1.6;
            }
            
            .prescription-section .section-content {
              border-left: 4px solid #28a745;
              background-color: #f8fff9;
            }
            
            .appointment-info {
              background-color: #fff9e6;
              border: 2px solid #ffe066;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 4px;
            }
            
            .appointment-info h3 {
              margin: 0 0 10px 0;
              font-size: 12pt;
              color: #8b6914;
            }
            
            .appointment-info div {
              margin-bottom: 5px;
              font-size: 11pt;
            }
            
            .documents-section {
              margin-top: 30px;
            }
            
            .section-title {
              background-color: #e9ecef;
              padding: 10px;
              margin-bottom: 15px;
              border-left: 4px solid #007bff;
              font-weight: bold;
              font-size: 12pt;
              text-transform: uppercase;
            }
            
            .document-embed {
              margin: 0;
              padding: 0;
              border: none;
              background-color: transparent;
              border-radius: 0;
              width: 100%;
            }
            
            .document-header h4 {
              font-weight: bold;
              margin: 0 0 5px 0;
              font-size: 12pt;
              color: #333;
            }
            
            .document-description {
              margin: 5px 0;
              font-style: italic;
              color: #666;
              font-size: 10pt;
            }
            
            .document-meta {
              margin-bottom: 15px;
              font-size: 9pt;
              color: #666;
              padding-bottom: 8px;
            }
            
            .document-content {
              width: 100%;
              overflow: visible;
            }
            
            .document-image-full {
              width: 100%;
              height: auto;
              max-width: 100%;
              border: 1px solid #ddd;
              border-radius: 3px;
              display: block;
              margin: 10px auto;
              object-fit: contain;
            }
            
            .pdf-placeholder,
            .file-placeholder {
              border: 2px dashed #ccc;
              padding: 30px;
              text-align: center;
              background-color: #f9f9f9;
              border-radius: 8px;
              margin: 20px 0;
            }
            
            .pdf-icon {
              font-size: 48px;
              margin-bottom: 15px;
            }
            
            .pdf-info h5 {
              font-size: 16pt;
              margin: 10px 0;
              color: #333;
            }
            
            .pdf-info p {
              font-size: 11pt;
              color: #666;
              margin: 8px 0;
            }
            
            .pdf-note {
              font-weight: bold;
              color: #2563eb;
            }
            
            .file-info {
              font-size: 11pt;
            }
            
            .file-info p {
              margin: 8px 0;
              color: #555;
            }
            
            .signature-section {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            
            .signature-box {
              border-top: 1px solid #000;
              width: 300px;
              margin: 30px auto 0;
              text-align: center;
              padding-top: 8px;
            }
            
            .signature-text {
              font-size: 10pt;
              color: #666;
            }
            
            .validity-note {
              margin-top: 20px;
              padding: 12px;
              background-color: #f0f8ff;
              border: 1px dashed #007bff;
              font-size: 9pt;
              text-align: center;
              color: #004085;
            }
            
            .medical-footer {
              margin-top: 30px;
              text-align: center;
              font-size: 8pt;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="medical-header">
            <h1>Prontuário Médico Odontológico</h1>
            <div class="subtitle">Registro Clínico do Paciente</div>
          </div>
          
          <div class="document-info">
            <div><strong>Prontuário Nº:</strong> ${record.id.substring(0, 8).toUpperCase()}</div>
            <div><strong>Impresso em:</strong> ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
          </div>
          
          <div class="patient-info">
            <h2>Identificação do Paciente</h2>
            <div class="patient-grid">
              <div class="patient-field full-width">
                <span class="field-label">Nome:</span>
                <span class="field-value">${patient?.full_name || 'Não informado'}</span>
              </div>
              
              <div class="patient-field">
                <span class="field-label">CPF:</span>
                <span class="field-value">${patient?.cpf || 'Não informado'}</span>
              </div>
              
              ${patient?.birth_date ? `
                <div class="patient-field">
                  <span class="field-label">Nascimento:</span>
                  <span class="field-value">${format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              ` : `
                <div class="patient-field">
                  <span class="field-label">Nascimento:</span>
                  <span class="field-value">Não informado</span>
                </div>
              `}
              
              <div class="patient-field">
                <span class="field-label">Sexo:</span>
                <span class="field-value">${patient?.gender || 'Não informado'}</span>
              </div>
              
              <div class="patient-field">
                <span class="field-label">Estado Civil:</span>
                <span class="field-value">${patient?.marital_status || 'Não informado'}</span>
              </div>
              
              <div class="patient-field">
                <span class="field-label">Profissão:</span>
                <span class="field-value">${patient?.profession || 'Não informado'}</span>
              </div>
              
              <div class="patient-field">
                <span class="field-label">Telefone:</span>
                <span class="field-value">${patient?.phone || 'Não informado'}</span>
              </div>
              
              ${patient?.responsible_name ? `
                <div class="patient-field">
                  <span class="field-label">Responsável:</span>
                  <span class="field-value">${patient.responsible_name}</span>
                </div>
                ${patient?.responsible_cpf ? `
                <div class="patient-field">
                  <span class="field-label">CPF Resp.:</span>
                  <span class="field-value">${patient.responsible_cpf}</span>
                </div>
                ` : ''}
              ` : ''}
              
              ${patient?.sus_card ? `
                <div class="patient-field">
                  <span class="field-label">Cartão SUS:</span>
                  <span class="field-value">${patient.sus_card}</span>
                </div>
              ` : ''}
              
              ${patient?.health_insurance ? `
                <div class="patient-field">
                  <span class="field-label">Convênio:</span>
                  <span class="field-value">${patient.health_insurance}</span>
                </div>
              ` : ''}
              
              ${patientAddress ? `
                <div class="patient-field full-width">
                  <span class="field-label">Endereço:</span>
                  <span class="field-value">${patientAddress}</span>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${appointment ? `
            <div class="appointment-info">
              <h3>Informações da Consulta</h3>
              <div><strong>Data:</strong> ${format(new Date(appointment.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
              ${appointment.procedures ? `<div><strong>Procedimento:</strong> ${appointment.procedures.name}</div>` : ''}
              ${professional ? `<div><strong>Profissional:</strong> Dr(a). ${professional.name}${professional.crm_cro ? ` - ${professional.crm_cro}` : ''}</div>` : ''}
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
          
          ${documentsEmbedHtml}
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-text">
                ${professional ? `Dr(a). ${professional.name}` : 'Assinatura do Profissional'}<br>
                ${professional?.crm_cro ? `${professional.crm_cro}` : 'CRO: _______________'}
              </div>
            </div>
          </div>
          
          <div class="validity-note">
            <strong>VALIDADE:</strong> Este documento tem validade legal conforme CFO. 
            Gerado em ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}.
          </div>
          
          <div class="medical-footer">
            Sistema de Prontuário Eletrônico<br>
            Prontuário: ${record.id.substring(0, 8).toUpperCase()} | Registro: ${format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar o conteúdo carregar antes de imprimir
      setTimeout(() => {
        printWindow.print();
      }, 2000);
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

  const previewDoc = async (doc: RecordDocument) => {
    if (doc.mime_type.startsWith('image/') || doc.mime_type === 'application/pdf') {
      setPreviewDocument(doc);
    } else {
      toast({
        title: 'Preview não disponível',
        description: 'Preview disponível apenas para imagens e PDFs',
        variant: 'default',
      });
    }
  };

  const getDocumentPreviewUrl = (doc: RecordDocument) => {
    return `https://qxsaiuojxdnsanyivcxd.supabase.co/storage/v1/object/public/documents/${doc.file_path}`;
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  // Fetch data when record changes
  useEffect(() => {
    if (record?.id && isOpen) {
      fetchDocuments(record.id);
      fetchRecordData(record);
      setSelectedDocuments([]);
    }
  }, [record?.id, isOpen]);

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-blue-600" />
              Prontuário Médico
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handlePrint} 
                variant="default" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loadingData}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Prontuário
              </Button>
            </div>
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
                    Identificação do Paciente
                  </h3>
                  {loadingData ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          Nome Completo:
                        </span>
                        <p className="mt-1 font-medium">{patient?.full_name || 'Não informado'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {patient?.cpf && (
                          <div>
                            <span className="font-medium text-gray-600 flex items-center gap-1">
                              <IdCard className="h-4 w-4" />
                              CPF:
                            </span>
                            <p className="mt-1">{patient.cpf}</p>
                          </div>
                        )}
                        
                        {patient?.birth_date && (
                          <div>
                            <span className="font-medium text-gray-600 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Data de Nascimento:
                            </span>
                            <p className="mt-1">{format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-600">Sexo:</span>
                          <p className="mt-1">{patient?.gender || 'Não informado'}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-600">Estado Civil:</span>
                          <p className="mt-1">{patient?.marital_status || 'Não informado'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Profissão:</span>
                        <p className="mt-1">{patient?.profession || 'Não informado'}</p>
                      </div>

                      {/* Dados do Responsável */}
                      {(patient?.responsible_name || patient?.responsible_cpf) && (
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-gray-700 flex items-center gap-1 mb-2">
                            <Users className="h-4 w-4" />
                            Responsável
                          </h4>
                          {patient?.responsible_name && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-600">Nome:</span>
                              <p className="mt-1">{patient.responsible_name}</p>
                            </div>
                          )}
                          {patient?.responsible_cpf && (
                            <div>
                              <span className="font-medium text-gray-600">CPF:</span>
                              <p className="mt-1">{patient.responsible_cpf}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Endereço */}
                      {patient && (patient.street || patient.city) && (
                        <div className="border-t pt-3">
                          <span className="font-medium text-gray-600 flex items-center gap-1 mb-2">
                            <Home className="h-4 w-4" />
                            Endereço Completo:
                          </span>
                          <p className="mt-1 leading-relaxed">
                            {[
                              patient.street,
                              patient.number,
                              patient.neighborhood,
                              patient.city,
                              patient.state
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Contato */}
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-gray-700 mb-2">Informações de Contato</h4>
                        {patient?.phone && (
                          <div className="flex items-start gap-2 mb-2">
                            <Phone className="h-4 w-4 mt-0.5 text-gray-600" />
                            <div>
                              <span className="font-medium text-gray-600">Telefone:</span>
                              <p className="mt-1">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient?.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="h-4 w-4 mt-0.5 text-gray-600" />
                            <div>
                              <span className="font-medium text-gray-600">Email:</span>
                              <p className="mt-1">{patient.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Informações Adicionais */}
                      {(patient?.sus_card || patient?.health_insurance) && (
                        <div className="border-t pt-3">
                          <h4 className="font-medium text-gray-700 mb-2">Informações de Saúde</h4>
                          {patient?.sus_card && (
                            <div className="mb-2">
                              <span className="font-medium text-gray-600">Cartão SUS:</span>
                              <p className="mt-1">{patient.sus_card}</p>
                            </div>
                          )}
                          {patient?.health_insurance && (
                            <div>
                              <span className="font-medium text-gray-600">Plano de Saúde:</span>
                              <p className="mt-1">{patient.health_insurance}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Informações da Consulta */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações da Consulta</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-600">Número do Prontuário:</span>
                      <p className="mt-1 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {record.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">Título:</span>
                      <p className="mt-1">{record.title || 'Sem título'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Registrado em: {format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>

                    {professional && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Dr(a). {professional.name}</span>
                        {professional.crm_cro && <span>- {professional.crm_cro}</span>}
                        {professional.specialty && <span>({professional.specialty})</span>}
                      </div>
                    )}

                    {appointment && (
                      <>
                        {appointment.procedures && (
                          <Badge variant="secondary" className="w-fit">
                            {appointment.procedures.name}
                          </Badge>
                        )}

                        <div>
                          <span className="font-medium text-gray-600">Data da consulta:</span>
                          <p className="mt-1">{format(new Date(appointment.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                        </div>
                      </>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Documentos Anexados</h3>
                {documents.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedDocuments.length} de {documents.length} selecionados para impressão
                  </div>
                )}
              </div>
            </div>
            <ScrollArea className="h-[calc(95vh-140px)] px-6 py-4">
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      />
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
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => previewDoc(doc)}
                          className="flex-shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                          className="flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
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

        {/* Preview Modal */}
        {previewDocument && (
          <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-2">
              <DialogHeader>
                <DialogTitle>{previewDocument.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                {previewDocument.mime_type.startsWith('image/') ? (
                  <img 
                    src={getDocumentPreviewUrl(previewDocument)} 
                    alt={previewDocument.name}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                ) : previewDocument.mime_type === 'application/pdf' ? (
                  <iframe
                    src={getDocumentPreviewUrl(previewDocument)}
                    className="w-full h-[70vh]"
                    title={previewDocument.name}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Preview não disponível para este tipo de arquivo</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
