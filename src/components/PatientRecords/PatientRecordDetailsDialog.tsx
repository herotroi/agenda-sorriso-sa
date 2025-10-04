import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, User, Calendar, Pill, Printer, Download, MapPin, Phone, Eye, IdCard, Mail, Users, Home, X, GripVertical, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HtmlContent } from '@/components/ui/html-content';

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

interface Profile {
  id: string;
  company_name?: string;
  company_logo?: string;
  cnpj?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
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
  const [documentOrder, setDocumentOrder] = useState<string[]>([]);
  const [showOrderControls, setShowOrderControls] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecordData = async (recordData: PatientRecord) => {
    setLoadingData(true);
    try {
      // Buscar dados do perfil da empresa
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, company_logo')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }
      }

      // Buscar dados do paciente
      if (recordData.patient_id) {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', recordData.patient_id)
          .maybeSingle();

        if (patientError) {
          console.error('Error fetching patient:', patientError);
        } else if (patientData) {
          setPatient(patientData);
        }
      }

      // Buscar dados do profissional
      if (recordData.professional_id) {
        const { data: professionalData, error: professionalError } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', recordData.professional_id)
          .maybeSingle();

        if (professionalError) {
          console.error('Error fetching professional:', professionalError);
        } else if (professionalData) {
          setProfessional(professionalData);
        }
      }

      // Buscar dados do agendamento
      if (recordData.appointment_id) {
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            procedures(name),
            professionals(id, name, specialty, crm_cro)
          `)
          .eq('id', recordData.appointment_id)
          .maybeSingle();

        if (appointmentError) {
          console.error('Error fetching appointment:', appointmentError);
        } else if (appointmentData) {
          setAppointment(appointmentData as any);

          // Fallback: se o registro não tiver profissional, usar o da consulta
          if (!recordData.professional_id) {
            const joinedProf = (appointmentData as any)?.professionals;
            if (joinedProf) {
              setProfessional(joinedProf as unknown as Professional);
            } else if ((appointmentData as any)?.professional_id) {
              const { data: professionalFromAppt } = await supabase
                .from('professionals')
                .select('*')
                .eq('id', (appointmentData as any).professional_id)
                .maybeSingle();
              if (professionalFromAppt) setProfessional(professionalFromAppt as Professional);
            }
          }
        }
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
      const docs = data || [];
      setDocuments(docs);
      // Initialize document order
      if (docs.length > 0 && documentOrder.length === 0) {
        setDocumentOrder(docs.map(doc => doc.id));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const moveDocumentUp = (index: number) => {
    if (index === 0) return;
    const orderedDocs = getOrderedDocuments();
    const newOrder = orderedDocs.map(doc => doc.id);
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setDocumentOrder(newOrder);
  };

  const moveDocumentDown = (index: number) => {
    const orderedDocs = getOrderedDocuments();
    if (index === orderedDocs.length - 1) return;
    const newOrder = orderedDocs.map(doc => doc.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setDocumentOrder(newOrder);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    
    const orderedDocs = getOrderedDocuments();
    const newOrder = orderedDocs.map(doc => doc.id);
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setDocumentOrder(newOrder);
    setDraggedIndex(null);
  };

  const getOrderedDocuments = () => {
    if (documentOrder.length === 0) {
      // Initialize with current documents order
      const initialOrder = documents.map(doc => doc.id);
      setDocumentOrder(initialOrder);
      return documents;
    }
    
    const orderedDocs = documentOrder
      .map(id => documents.find(doc => doc.id === id))
      .filter(Boolean) as RecordDocument[];
    
    // Add any new documents that aren't in the order yet
    const unorderedDocs = documents.filter(doc => !documentOrder.includes(doc.id));
    
    return [...orderedDocs, ...unorderedDocs];
  };

  const handlePrint = async () => {
    if (!record || !patient) return;

    const currentDate = new Date();
    const shortId = record.id.substring(0, 8).toUpperCase();
    
    // Buscar e incorporar documentos selecionados usando a ordem personalizada
    const orderedDocs = getOrderedDocuments();
    const selectedDocs = orderedDocs.filter(doc => selectedDocuments.includes(doc.id));
    let documentsEmbedHtml = '';

    if (selectedDocs.length > 0) {
      const documentPromises = selectedDocs.map(async (doc) => {
        const docUrl = getDocumentPreviewUrl(doc);
        
        if (doc.mime_type.startsWith('image/')) {
          return `
            <div class="page-break">
              <div class="document-section">
                <h3>${doc.name}</h3>
                ${doc.description ? `<p class="document-description">${doc.description}</p>` : ''}
                <img src="${docUrl}" alt="${doc.name}" class="document-image" />
              </div>
            </div>
          `;
        }
        return '';
      });

      const resolvedDocuments = await Promise.all(documentPromises);
      documentsEmbedHtml = resolvedDocuments.filter(Boolean).join('');
    }

    const printContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <title>Prontuário Médico - ${patient.full_name}</title>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.4;
              color: #000;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
              
              .page-break {
                page-break-before: always;
              }
              
              .no-break {
                page-break-inside: avoid;
              }
            }
            
            /* Cabeçalho do documento */
            .document-header {
              text-align: center;
              padding-bottom: 10px;
              margin-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            
            .company-name {
              font-size: 18pt;
              font-weight: bold;
              color: #1a4d8f;
              margin-bottom: 3px;
            }
            
            .company-cnpj {
              font-size: 9pt;
              color: #666;
              margin-bottom: 8px;
            }
            
            .professional-info {
              font-size: 10pt;
              color: #333;
              line-height: 1.3;
            }
            
            .record-number {
              font-size: 10pt;
              margin-top: 8px;
              font-weight: bold;
            }
            
            .print-date {
              font-size: 9pt;
              color: #666;
            }
            
            /* Seções */
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            
            .section-title {
              font-size: 13pt;
              font-weight: bold;
              color: #000;
              text-transform: uppercase;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 2px solid #333;
            }
            
            /* Grade de informações */
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
              margin-bottom: 10px;
            }
            
            .info-item {
              font-size: 10pt;
              line-height: 1.5;
            }
            
            .info-label {
              font-weight: bold;
              display: inline;
              margin-right: 5px;
            }
            
            .info-value {
              display: inline;
            }
            
            /* Informações de consulta */
            .consultation-box {
              background: #f8f9fa;
              padding: 10px;
              border-radius: 5px;
              margin-bottom: 15px;
              border: 1px solid #ddd;
            }
            
            .consultation-item {
              font-size: 10pt;
              margin-bottom: 5px;
            }
            
            /* Conteúdo clínico */
            .clinical-content {
              background: #fff;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
              margin-bottom: 15px;
              min-height: 100px;
              font-size: 10pt;
              line-height: 1.6;
            }
            
            /* Assinatura */
            .signature-section {
              margin-top: 40px;
              text-align: center;
            }
            
            .signature-line {
              width: 300px;
              border-top: 1px solid #000;
              margin: 0 auto 5px;
            }
            
            .signature-name {
              font-weight: bold;
              font-size: 10pt;
            }
            
            .signature-crm {
              font-size: 9pt;
              color: #666;
            }
            
            /* Rodapé */
            .document-footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 8pt;
              color: #666;
              text-align: center;
              line-height: 1.4;
            }
            
            .footer-validity {
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .footer-address {
              margin-bottom: 5px;
            }
            
            .footer-system {
              font-style: italic;
              color: #999;
            }
            
            /* Documentos */
            .document-section {
              margin-top: 20px;
              text-align: center;
            }
            
            .document-section h3 {
              font-size: 12pt;
              margin-bottom: 10px;
            }
            
            .document-description {
              font-size: 9pt;
              color: #666;
              margin-bottom: 10px;
              font-style: italic;
            }
            
            .document-image {
              max-width: 80%;
              height: auto;
              max-height: 600px;
              object-fit: contain;
              border: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <!-- Cabeçalho do Documento -->
          <div class="document-header">
            <div class="company-name">${profile?.company_name || 'Clínica Médica'}</div>
            ${profile?.cnpj ? `<div class="company-cnpj">CNPJ: ${profile.cnpj}</div>` : ''}
            
            ${professional ? `
              <div class="professional-info">
                Profissional: Dr(a). ${professional.name}<br>
                ${professional.specialty ? `Especialidade: ${professional.specialty}<br>` : ''}
                ${professional.crm_cro ? `CRM/CRO: ${professional.crm_cro}` : ''}
              </div>
            ` : ''}
            
            <div class="record-number">Prontuário Nº: ${shortId}</div>
            <div class="print-date">Impresso em: ${format(currentDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
          </div>
          
          <!-- Identificação do Paciente -->
          <div class="section">
            <h2 class="section-title">Identificação do Paciente</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Nome:</span>
                <span class="info-value">${patient.full_name}</span>
              </div>
              ${patient.cpf ? `
                <div class="info-item">
                  <span class="info-label">CPF:</span>
                  <span class="info-value">${patient.cpf}</span>
                </div>
              ` : ''}
              ${patient.birth_date ? `
                <div class="info-item">
                  <span class="info-label">Nascimento:</span>
                  <span class="info-value">${format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              ` : ''}
              ${patient.gender ? `
                <div class="info-item">
                  <span class="info-label">Sexo:</span>
                  <span class="info-value">${patient.gender}</span>
                </div>
              ` : ''}
              ${patient.marital_status ? `
                <div class="info-item">
                  <span class="info-label">Estado Civil:</span>
                  <span class="info-value">${patient.marital_status}</span>
                </div>
              ` : ''}
              ${patient.profession ? `
                <div class="info-item">
                  <span class="info-label">Profissão:</span>
                  <span class="info-value">${patient.profession}</span>
                </div>
              ` : ''}
              ${patient.phone ? `
                <div class="info-item">
                  <span class="info-label">Telefone:</span>
                  <span class="info-value">${patient.phone}</span>
                </div>
              ` : ''}
              ${patient.sus_card ? `
                <div class="info-item">
                  <span class="info-label">Cartão SUS:</span>
                  <span class="info-value">${patient.sus_card}</span>
                </div>
              ` : ''}
              ${patient.health_insurance ? `
                <div class="info-item">
                  <span class="info-label">Convênio:</span>
                  <span class="info-value">${patient.health_insurance}</span>
                </div>
              ` : ''}
            </div>
            
            ${patient.street ? `
              <div class="info-item" style="margin-top: 8px;">
                <span class="info-label">Endereço:</span>
                <span class="info-value">
                  ${[patient.street, patient.number, patient.neighborhood, patient.city, patient.state].filter(Boolean).join(', ')}
                </span>
              </div>
            ` : ''}
          </div>
          
          <!-- Informações da Consulta -->
          ${appointment ? `
            <div class="section">
              <h2 class="section-title">Informações da Consulta</h2>
              <div class="consultation-box">
                <div class="consultation-item">
                  <span class="info-label">Data:</span>
                  ${format(new Date(appointment.start_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                ${appointment.procedures ? `
                  <div class="consultation-item">
                    <span class="info-label">Procedimento:</span>
                    ${appointment.procedures.name}
                  </div>
                ` : ''}
                ${professional ? `
                  <div class="consultation-item">
                    <span class="info-label">Profissional:</span>
                    Dr(a). ${professional.name}${professional.crm_cro ? ' - ' + professional.crm_cro : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Anamnese e Exame Clínico -->
          ${record.content || record.notes ? `
            <div class="section">
              <h2 class="section-title">Anamnese e Exame Clínico</h2>
              <div class="clinical-content">
                ${record.content || record.notes || ''}
              </div>
            </div>
          ` : ''}
          
          <!-- Prescrição Médica -->
          ${record.prescription ? `
            <div class="section">
              <h2 class="section-title">Prescrição Médica</h2>
              <div class="clinical-content">
                ${record.prescription}
              </div>
            </div>
          ` : ''}
          
          <!-- Assinatura -->
          ${professional ? `
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-name">Dr(a). ${professional.name}</div>
              ${professional.crm_cro ? `<div class="signature-crm">CRM: ${professional.crm_cro}</div>` : ''}
            </div>
          ` : ''}
          
          <!-- Rodapé -->
          <div class="document-footer">
            <div class="footer-validity">
              VALIDADE: Este documento tem validade legal conforme CFO. Gerado em ${format(currentDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}.
            </div>
            ${profile?.street ? `
              <div class="footer-address">
                Endereço: ${[profile.street, profile.number, profile.neighborhood, profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ')}
              </div>
            ` : ''}
            ${profile?.email || profile?.phone ? `
              <div class="footer-address">
                Contatos: ${[profile.email, profile.phone].filter(Boolean).join(' | ')}
              </div>
            ` : ''}
            <div class="footer-system">
              Sistema de Prontuário Eletrônico | Prontuário: ${shortId} | Registro: ${format(new Date(record.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          </div>
          
          ${documentsEmbedHtml}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar carregamento completo antes de imprimir
      printWindow.onload = () => {
        const doPrint = () => printWindow.print();
        if (printWindow.document.fonts && printWindow.document.fonts.ready) {
          printWindow.document.fonts.ready.then(doPrint).catch(doPrint);
        } else {
          setTimeout(doPrint, 500);
        }
      };
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
      setDocumentOrder([]);
      setShowOrderControls(false);
      setDraggedIndex(null);
    }
  }, [record?.id, isOpen]);

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-6 w-6 text-blue-600" />
                Prontuário Médico
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalhes do prontuário médico do paciente
              </DialogDescription>
            </div>
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
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Fechar">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
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

                    {/* CID Codes */}
                    {(record as any).icd_codes && Array.isArray((record as any).icd_codes) && (record as any).icd_codes.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">Códigos CID:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(record as any).icd_codes.map((icd: any, idx: number) => (
                            <Badge key={`${icd.code}-${idx}`} variant="outline" className="text-xs">
                              {icd.code} - {icd.version}
                              {icd.title && <span className="ml-1 text-muted-foreground">({icd.title})</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Anamnese e Exame */}
                {(record.content || record.notes) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Anamnese e Exame Clínico</h3>
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <HtmlContent 
                        content={record.content || record.notes || ''} 
                        className="text-sm leading-relaxed"
                      />
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
                      <HtmlContent 
                        content={record.prescription || ''} 
                        className="text-sm leading-relaxed"
                      />
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
                <div className="flex items-center gap-2">
                  {documents.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOrderControls(!showOrderControls)}
                      className="text-xs"
                    >
                      {showOrderControls ? 'Ocultar' : 'Ordenar'}
                    </Button>
                  )}
                  {documents.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {selectedDocuments.length} de {documents.length} selecionados
                    </div>
                  )}
                </div>
              </div>
              {showOrderControls && documents.length > 1 && (
                <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <GripVertical className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Como reordenar os documentos:
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• <strong>Arrastar e soltar:</strong> Clique e arraste os documentos para nova posição</li>
                        <li>• <strong>Botões de seta:</strong> Use ↑ ↓ para mover um de cada vez</li>
                        <li>• <strong>Posição:</strong> A numeração mostra a ordem de impressão</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <ScrollArea className="h-[calc(95vh-140px)] px-6 py-4">
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : documents.length > 0 ? (
                <div className="space-y-3">
                  {getOrderedDocuments().map((doc, index) => (
                    <div 
                      key={doc.id} 
                      className={`flex items-start gap-2 p-4 border rounded-lg bg-white transition-all ${
                        showOrderControls 
                          ? draggedIndex === index 
                            ? 'cursor-grabbing opacity-50 scale-105 border-blue-300 bg-blue-50' 
                            : 'cursor-grab hover:bg-blue-50 hover:border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      draggable={showOrderControls}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      {showOrderControls && (
                        <div className="flex flex-col gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDocumentUp(index)}
                            disabled={index === 0}
                            className="p-1 h-6 w-6"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDocumentDown(index)}
                            disabled={index === getOrderedDocuments().length - 1}
                            className="p-1 h-6 w-6"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate text-sm">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                        )}
                        {!showOrderControls && (
                          <>
                            <p className="text-xs text-gray-500 mt-2">
                              Enviado em {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                            <p className="text-xs text-gray-500">
                              Tamanho: {(doc.file_size / 1024).toFixed(1)} KB
                            </p>
                          </>
                        )}
                        {showOrderControls && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            Posição: {index + 1}
                          </p>
                        )}
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
