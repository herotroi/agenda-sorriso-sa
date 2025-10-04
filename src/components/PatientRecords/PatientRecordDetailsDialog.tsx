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
  professionals?: { name: string; specialty?: string; crm_cro?: string };
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
  const [linkedAppointments, setLinkedAppointments] = useState<Appointment[]>([]);
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

      // Buscar agendamentos vinculados (2 etapas por falta de FK declarada)
      const { data: linkRows, error: linkErr } = await supabase
        .from('record_appointments')
        .select('appointment_id')
        .eq('record_id', recordData.id);

      if (linkErr) {
        console.error('Error fetching linked appointment ids:', linkErr);
      } else if (linkRows && linkRows.length > 0) {
        const ids = linkRows.map((r: any) => r.appointment_id).filter(Boolean);
        if (ids.length > 0) {
          const { data: apptsData, error: apptsErr } = await supabase
            .from('appointments')
            .select(`
              id,
              start_time,
              end_time,
              procedures(name),
              professionals(id, name, specialty, crm_cro)
            `)
            .in('id', ids)
            .order('start_time', { ascending: true });

          if (apptsErr) {
            console.error('Error fetching linked appointments:', apptsErr);
          } else if (apptsData) {
            setLinkedAppointments(apptsData as any);
            // Se não houver appointment principal, use o primeiro da lista
            if (!recordData.appointment_id && apptsData.length > 0) {
              setAppointment(apptsData[0] as any);
            }
          }
        }
      }

      // Buscar dados do agendamento principal (compatibilidade legada)
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
    if (!record) return;

    const currentDate = new Date();
    const patientAddress = patient ? [
      patient.street,
      patient.number,
      patient.neighborhood,
      patient.city,
      patient.state
    ].filter(Boolean).join(', ') : '';

    // Buscar e incorporar documentos selecionados usando a ordem personalizada
    const orderedDocs = getOrderedDocuments();
    const selectedDocs = orderedDocs.filter(doc => selectedDocuments.includes(doc.id));
    let documentsEmbedHtml = '';

    if (selectedDocs.length > 0) {
      const documentPromises = selectedDocs.map(async (doc) => {
        const docUrl = getDocumentPreviewUrl(doc);
        
        if (doc.mime_type.startsWith('image/')) {
          return `
            <div class="document-item">
              <div class="document-info-bar">
                <strong>${doc.name}</strong>
                ${doc.description ? `<p style="margin: 4px 0; font-size: 9pt; color: #666;">${doc.description}</p>` : ''}
              </div>
              <div class="document-image-container">
                <img src="${docUrl}" alt="${doc.name}" class="document-image-full" />
              </div>
            </div>
          `;
        } else if (doc.mime_type === 'application/pdf') {
          return `
            <div class="document-item pdf-item">
              <div class="document-info-bar">
                <span class="pdf-icon">📄</span>
                <strong>${doc.name}</strong>
                ${doc.description ? `<p style="margin: 4px 0; font-size: 9pt; color: #666;">${doc.description}</p>` : ''}
              </div>
              <div class="pdf-info-box">
                <p style="font-size: 9pt; margin: 4px 0;"><strong>Tipo:</strong> PDF</p>
                <p style="font-size: 8pt; margin: 4px 0; color: #666;">Acesso: ${docUrl}</p>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="document-item file-item">
              <div class="document-info-bar">
                <strong>${doc.name}</strong>
                ${doc.description ? `<p style="margin: 4px 0; font-size: 9pt; color: #666;">${doc.description}</p>` : ''}
              </div>
              <div class="file-info-box">
                <p style="font-size: 9pt; margin: 4px 0;"><strong>Tipo:</strong> ${doc.mime_type}</p>
                <p style="font-size: 8pt; margin: 4px 0; color: #666;">Acesso: ${docUrl}</p>
              </div>
            </div>
          `;
        }
      });

      const resolvedDocuments = await Promise.all(documentPromises);
      
      documentsEmbedHtml = `
        <div class="medical-section">
          <div class="section-header">Documentos Anexados (${selectedDocs.length})</div>
          <div class="section-content">
            ${resolvedDocuments.join('')}
          </div>
        </div>
      `;
    }

    // Consultas vinculadas no formato de lista (mesclar com appointment)
    let allAppointmentsHtml = '';
    const allAppts = linkedAppointments && linkedAppointments.length > 0 ? linkedAppointments : (appointment ? [appointment] : []);
    
    if (allAppts.length > 0) {
      const sortedAppts = allAppts.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      
      const appointmentsItems = sortedAppts.map((appt, index) => {
        const dateStr = format(new Date(appt.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR });
        const proc = appt.procedures?.name || '-';
        const prof = appt.professionals ? `Dr(a). ${appt.professionals.name}${appt.professionals.crm_cro ? ' - ' + appt.professionals.crm_cro : ''}` : '-';
        
        return `
          ${index > 0 ? '<div style="border-top: 1px solid #e5e7eb; margin: 12px 0;"></div>' : ''}
          <div class="appointment-field">
            <span class="field-label">Data:</span>
            <span class="field-value">${dateStr}</span>
          </div>
          <div class="appointment-field">
            <span class="field-label">Procedimento:</span>
            <span class="field-value">${proc}</span>
          </div>
          <div class="appointment-field">
            <span class="field-label">Profissional:</span>
            <span class="field-value">${prof}</span>
          </div>
        `;
      }).join('');

      allAppointmentsHtml = `
        <div class="appointment-info">
          <h3>Informações da${allAppts.length > 1 ? 's' : ''} Consulta${allAppts.length > 1 ? 's' : ''}</h3>
          <div class="appointment-grid">
            ${appointmentsItems}
          </div>
        </div>
      `;
    }

    // CIDs no final da impressão
    let icdHtml = '';
    try {
      const r: any = record;
      let icds: any[] = [];
      if (r?.icd_codes) {
        icds = typeof r.icd_codes === 'string' ? JSON.parse(r.icd_codes) : r.icd_codes;
      } else if (r?.icd_code && r?.icd_version) {
        icds = [{ code: r.icd_code, version: r.icd_version, title: `${r.icd_code} - ${r.icd_version}` }];
      }
      if (Array.isArray(icds) && icds.length > 0) {
        // Unificar por código+versão
        const unique = new Map<string, any>();
        for (const item of icds) {
          if (!item) continue;
          const key = `${item.code || ''}-${item.version || ''}`;
          if (!unique.has(key)) unique.set(key, item);
        }
        const rows = Array.from(unique.values()).map((item: any) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 500;">${item.code || '-'}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${item.title || item.version || ''}</td>
          </tr>
        `).join('');
        icdHtml = `
          <div class="medical-section">
            <div class="section-header">Códigos CID</div>
            <div class="section-content">
              <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600; width: 120px;">Código</th>
                    <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left; font-weight: 600;">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.error('Erro ao preparar CIDs para impressão:', e);
    }

    const printContent = `
      <html>
        <head>
          <title>Prontuário Médico - ${patient?.full_name || 'Paciente'}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page { 
                margin: 12mm 12mm 12mm 12mm; 
                size: A4 portrait;
              }
              
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
                margin: 0;
                padding: 0;
              }
              
              /* Table-based print structure for proper header/footer positioning */
              .print-grid {
                display: table !important;
                width: 100% !important;
                height: 100% !important;
                table-layout: fixed !important;
              }
              
              .print-header {
                display: table-header-group !important;
                position: static !important;
                height: auto !important;
                text-align: center !important;
                color: #666 !important;
                font-size: 14px !important;
                padding: 10mm 0 6mm 0 !important;
                margin: 0 !important;
                background: white !important;
                box-sizing: border-box !important;
              }
              
              .print-footer {
                display: table-footer-group !important;
                position: static !important;
                height: auto !important;
                text-align: center !important;
                color: #666 !important;
                font-size: 10px !important;
                padding: 6mm 0 0 0 !important;
                margin: 0 !important;
                background: white !important;
                box-sizing: border-box !important;
              }
              
              .print-content {
                display: table-row-group !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: auto !important;
              }
              
              /* Remover divisórias visuais na impressão, exceto tabelas */
              .print-content, .print-content *:not(table):not(thead):not(tbody):not(tr):not(th):not(td) {
                border: none !important;
                box-shadow: none !important;
              }
              
              /* Forçar bordas em tabelas */
              .print-content table {
                border-collapse: collapse !important;
                width: 100% !important;
                border: 1px solid #000 !important;
              }
              
              .print-content th,
              .print-content td {
                border: 1px solid #000 !important;
                padding: 6px 8px !important;
              }
              
              .signature-box {
                border-top: 1px solid #000 !important;
              }
              
              .page-break {
                page-break-before: always !important;
                page-break-inside: avoid !important;
              }
              
              .page-break:first-child {
                page-break-before: auto !important;
              }
              
              .document-image-full {
                width: 50% !important;
                max-width: 50% !important;
                height: auto !important;
                max-height: 400px !important;
                object-fit: contain !important;
                display: block !important;
                margin: 10px auto !important;
                border: 1px solid #ddd !important;
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
                padding: 6px !important;
                text-align: center !important;
                background-color: transparent !important;
                border-radius: 4px !important;
                margin: 6px 0 !important;
                height: 25vh !important;
                max-height: 25vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                overflow: hidden !important;
              }
              
              .pdf-icon {
                font-size: 20px !important;
                margin-bottom: 4px !important;
              }
              
              .pdf-info h5 {
                font-size: 9pt !important;
                margin: 3px 0 !important;
                color: #333 !important;
              }
              
              .pdf-info p {
                font-size: 7pt !important;
                color: #666 !important;
                margin: 2px 0 !important;
              }
              
              .pdf-note {
                font-weight: bold !important;
                color: #2563eb !important;
              }
              
              /* Permitir quebra de página em blocos grandes */
              .medical-section,
              .patient-info,
              .appointment-info,
              .documents-section,
              .document-content,
              .section-content {
                break-inside: auto !important;
                page-break-inside: auto !important;
                overflow: visible !important;
                margin-bottom: 15px !important;
                white-space: pre-wrap !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
                min-height: 0 !important;
              }
              
              /* Estilos para documentos na impressão */
              .document-item {
                margin: 12px 0 !important;
                padding: 8px !important;
                border: 1px solid #e5e7eb !important;
                border-radius: 4px !important;
                page-break-inside: avoid !important;
              }
              
              .document-info-bar {
                margin-bottom: 8px !important;
                padding-bottom: 6px !important;
                border-bottom: 1px solid #e5e7eb !important;
              }
              
              .document-info-bar strong {
                font-size: 10pt !important;
                color: #000 !important;
              }
              
              .document-image-container {
                text-align: center !important;
                margin: 8px 0 !important;
              }
              
              .document-image-full { 
                margin: 8px auto !important; 
                border: 1px solid #ddd !important; 
                max-height: 400px !important;
                width: 60% !important; 
                max-width: 60% !important;
                height: auto !important;
                object-fit: contain !important;
              }
              
              .pdf-icon {
                font-size: 16px !important;
                margin-right: 6px !important;
              }
              
              .pdf-info-box,
              .file-info-box {
                padding: 8px !important;
                background-color: #f9fafb !important;
                border-radius: 4px !important;
              }
              
              .signature-section {
                page-break-inside: avoid !important;
                margin-top: 30px !important;
              }

              /* Evitar quebra logo após títulos */
              .section-header,
              .section-title {
                break-after: avoid-page !important;
                page-break-after: avoid !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              /* Assinatura sempre na mesma página */
              .signature-section {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
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
              margin: 0 0 15px 0;
              font-size: 12pt;
              color: #555;
            }

            .professional-info {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #ccc;
              text-align: left;
            }

            .prof-line {
              margin: 5px 0;
              font-size: 11pt;
              color: #333;
            }
            
            .document-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              padding: 8px;
              background-color: transparent;
              border: 1px solid #ccc;
              font-size: 10pt;
            }
            
            .patient-info {
              margin-bottom: 20px;
              border: 2px solid #000;
              background-color: transparent;
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
              border-right: 1px solid #666;
              border-bottom: 1px solid #666;
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
              background-color: transparent;
              min-height: 80px;
              white-space: pre-wrap;
              font-size: 11pt;
              line-height: 1.6;
            }
            
            .prescription-section .section-content {
              border-left: 4px solid #28a745;
              background-color: transparent;
            }
            
            .appointment-info {
              margin-bottom: 20px;
              border: 2px solid #000;
              background-color: transparent;
            }
            
            .appointment-info h3 {
              margin: 0;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              background-color: #e0e0e0;
              padding: 10px;
              border-bottom: 1px solid #000;
              text-align: center;
            }
            
            .appointment-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 0;
              padding: 0;
            }
            
            .appointment-field {
              padding: 6px 12px;
              border-bottom: 1px solid #666;
              font-size: 10pt;
              min-height: 20px;
              display: flex;
              align-items: center;
            }
            
            .appointment-field:last-child {
              border-bottom: none;
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
              padding: 8px;
              text-align: center;
              background-color: transparent;
              border-radius: 4px;
              margin: 5px 0;
              height: 25vh;
              max-height: 25vh;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            
            .pdf-icon {
              font-size: 20px;
              margin-bottom: 4px;
            }
            
            .pdf-info h5 {
              font-size: 9pt;
              margin: 3px 0;
              color: #333;
            }
            
            .pdf-info p {
              font-size: 7pt;
              color: #666;
              margin: 2px 0;
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
              background-color: transparent;
              border: 1px dashed #007bff;
              font-size: 9pt;
              text-align: center;
              color: #004085;
            }
            
            .medical-footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #000;
              font-size: 10pt;
              color: #333;
              page-break-inside: avoid;
            }

            .footer-info {
              margin-bottom: 10px;
            }

            .footer-section {
              margin: 5px 0;
              line-height: 1.4;
            }

            .footer-system {
              font-size: 8pt;
              color: #666;
              text-align: center;
              border-top: 1px solid #ddd;
              padding-top: 10px;
              margin-top: 10px;
            }

            /* Marca d'água da logo - aparece em todas as páginas */
            .print-content {
              position: relative;
            }

            .print-content::before {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 600px;
              height: 600px;
              background-image: url('${profile?.company_logo || ''}');
              background-repeat: no-repeat;
              background-position: center;
              background-size: contain;
              opacity: 0.15;
              z-index: -1;
              pointer-events: none;
            }

            @media print {
              .print-content::before {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 600px;
                height: 600px;
                opacity: 0.12;
                z-index: -1;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-grid">
            <div class="print-header">
              <h1>${profile?.company_name || 'Clínica Odontológica'}</h1>
              <div class="subtitle">CNPJ: ${profile?.cnpj || 'Não informado'}</div>
              
              <div class="professional-info">
                <div class="prof-line">
                  <strong>Profissional:</strong> Dr(a). ${professional?.name || 'Não informado'}
                </div>
                ${professional?.specialty ? `<div class="prof-line"><strong>Especialidade:</strong> ${professional.specialty}</div>` : ''}
                ${professional?.crm_cro ? `<div class="prof-line"><strong>CRM/CRO:</strong> ${professional.crm_cro}</div>` : ''}
              </div>
            </div>
            
            <div class="print-content">
          
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
          
          ${allAppointmentsHtml}
          
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
          
          ${icdHtml}
          
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
           
           </div>
           
            <div class="print-footer">
              <div class="footer-info">
                <div class="footer-section">
                  <strong>Endereço:</strong>
                  ${profile ? [
                    profile.street,
                    profile.number,
                    profile.neighborhood,
                    profile.city,
                    profile.state,
                    profile.zip_code
                  ].filter(Boolean).join(', ') || 'Não informado' : 'Não informado'}
                </div>
                <div class="footer-section">
                  <strong>Contatos:</strong>
                  ${profile?.email || 'Email não informado'} | ${profile?.phone || 'Telefone não informado'}
                </div>
              </div>
              <div class="footer-system">
                Sistema de Prontuário Eletrônico | Prontuário: ${record.id.substring(0, 8).toUpperCase()} | Registro: ${format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
            </div>
          </div>
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
          doPrint();
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

                    {/* Agendamentos Vinculados */}
                    {linkedAppointments.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">
                          {linkedAppointments.length > 1 ? 'Consultas Vinculadas:' : 'Consulta Vinculada:'}
                        </span>
                        <div className="mt-2 space-y-2">
                          {linkedAppointments.map((appt, index) => (
                            <div key={appt.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-sm">
                                  {format(new Date(appt.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{format(new Date(appt.start_time), 'HH:mm', { locale: ptBR })}</span>
                                  {appt.end_time && <span>- {format(new Date(appt.end_time), 'HH:mm', { locale: ptBR })}</span>}
                                </div>
                                {appt.procedures && (
                                  <Badge variant="secondary" className="w-fit text-xs">
                                    {appt.procedures.name}
                                  </Badge>
                                )}
                                {appt.professionals && (
                                  <div className="flex items-center gap-1 sm:col-span-2">
                                    <User className="h-3 w-3" />
                                    <span>Dr(a). {appt.professionals.name}</span>
                                    {appt.professionals.crm_cro && <span className="text-gray-500">- {appt.professionals.crm_cro}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback: appointment_id antigo (se não houver linkedAppointments) */}
                    {linkedAppointments.length === 0 && appointment && (
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
