import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProntuarioPrintButtonProps {
  selectedPatient: string;
  disabled?: boolean;
}

export function ProntuarioPrintButton({ selectedPatient, disabled }: ProntuarioPrintButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePrint = async () => {
    if (!selectedPatient || !user?.id) return;

    setLoading(true);
    try {
      // Buscar dados do paciente
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', selectedPatient)
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Buscar perfil/empresa
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Buscar todos os registros médicos do paciente
      const { data: records, error: recordsError } = await supabase
        .from('patient_records')
        .select(`
          *,
          professionals(name, specialty, crm_cro)
        `)
        .eq('patient_id', selectedPatient)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Buscar todas as consultas vinculadas a esses registros
      const recordIds = records?.map(r => r.id) || [];
      let allAppointments: any[] = [];
      
      if (recordIds.length > 0) {
        const { data: linkedAppts } = await supabase
          .from('record_appointments')
          .select('appointment_id, record_id')
          .in('record_id', recordIds);

        const appointmentIds = [...new Set(linkedAppts?.map(la => la.appointment_id) || [])];
        
        if (appointmentIds.length > 0) {
          const { data: appointments } = await supabase
            .from('appointments')
            .select(`
              id,
              start_time,
              end_time,
              status_id,
              procedures(name),
              professionals(name, specialty),
              appointment_statuses(label)
            `)
            .in('id', appointmentIds)
            .eq('user_id', user.id)
            .order('start_time', { ascending: false });

          allAppointments = appointments || [];
        }
      }

      // Buscar todos os documentos do paciente
      const { data: documents } = await supabase
        .from('prontuario_documents')
        .select('id, name, description, file_size, uploaded_at, record_id, appointment_id')
        .eq('patient_id', selectedPatient)
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      // Consolidar todos os códigos CID
      const allIcdCodes: any[] = [];
      records?.forEach(record => {
        if (record.icd_codes) {
          try {
            const codes = typeof record.icd_codes === 'string' 
              ? JSON.parse(record.icd_codes) 
              : record.icd_codes;
            if (Array.isArray(codes)) {
              codes.forEach(code => {
                if (!allIcdCodes.some(icd => icd.code === code.code && icd.version === code.version)) {
                  allIcdCodes.push(code);
                }
              });
            }
          } catch (e) {
            console.error('Error parsing ICD codes:', e);
          }
        }
        // Código legado
        if (record.icd_code && record.icd_version) {
          if (!allIcdCodes.some(icd => icd.code === record.icd_code)) {
            allIcdCodes.push({
              code: record.icd_code,
              version: record.icd_version,
              title: `${record.icd_code} - ${record.icd_version}`
            });
          }
        }
      });

      // Gerar HTML para impressão
      const printHTML = generatePrintHTML(
        patient,
        profile,
        records || [],
        allAppointments,
        documents || [],
        allIcdCodes
      );

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (error) {
      console.error('Error generating print:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar impressão do prontuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePrint}
      disabled={disabled || loading || !selectedPatient}
      variant="outline"
      className="w-full sm:w-auto"
    >
      <Printer className="h-4 w-4 mr-2" />
      {loading ? 'Gerando...' : 'Imprimir Prontuário'}
    </Button>
  );
}

function generatePrintHTML(
  patient: any,
  profile: any,
  records: any[],
  appointments: any[],
  documents: any[],
  icdCodes: any[]
): string {
  const now = new Date();
  
  // Gerar IDs de prontuário curtos para cada registro
  const recordsWithShortId = records.map(rec => ({
    ...rec,
    shortId: rec.id.substring(0, 8).toUpperCase()
  }));
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prontuário Médico - ${patient.full_name}</title>
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
        
        .clinical-title {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        
        /* Tabelas */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 9pt;
        }
        
        th {
          background: #f0f0f0;
          font-weight: bold;
          padding: 8px;
          border: 1px solid #000;
          text-align: left;
        }
        
        td {
          padding: 6px 8px;
          border: 1px solid #000;
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
      </style>
    </head>
    <body>
      ${recordsWithShortId.map((record, index) => {
        // Encontrar consulta relacionada
        const relatedAppointment = appointments.find(apt => 
          record.appointments?.id === apt.id || record.appointment_id === apt.id
        );
        
        // Pegar códigos CID deste registro
        let recordIcds: any[] = [];
        if (record.icd_codes) {
          try {
            recordIcds = typeof record.icd_codes === 'string' 
              ? JSON.parse(record.icd_codes) 
              : record.icd_codes;
          } catch (e) {
            console.error('Error parsing ICD codes');
          }
        }
        
        return `
          ${index > 0 ? '<div class="page-break"></div>' : ''}
          
          <!-- Cabeçalho do Documento -->
          <div class="document-header">
            <div class="company-name">${profile?.company_name || 'Clínica Médica'}</div>
            ${profile?.cnpj ? `<div class="company-cnpj">CNPJ: ${profile.cnpj}</div>` : ''}
            
            ${record.professionals ? `
              <div class="professional-info">
                Profissional: Dr(a). ${record.professionals.name}<br>
                ${record.professionals.specialty ? `Especialidade: ${record.professionals.specialty}<br>` : ''}
                ${record.professionals.crm_cro ? `CRM/CRO: ${record.professionals.crm_cro}` : ''}
              </div>
            ` : ''}
            
            <div class="record-number">Prontuário Nº: ${record.shortId}</div>
            <div class="print-date">Impresso em: ${format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
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
          ${relatedAppointment ? `
            <div class="section">
              <h2 class="section-title">Informações da Consulta</h2>
              <div class="consultation-box">
                <div class="consultation-item">
                  <span class="info-label">Data:</span>
                  ${format(new Date(relatedAppointment.start_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
                ${relatedAppointment.procedures ? `
                  <div class="consultation-item">
                    <span class="info-label">Procedimento:</span>
                    ${relatedAppointment.procedures.name}
                  </div>
                ` : ''}
                ${relatedAppointment.professionals ? `
                  <div class="consultation-item">
                    <span class="info-label">Profissional:</span>
                    Dr(a). ${relatedAppointment.professionals.name}${relatedAppointment.professionals.crm_cro ? ' - ' + relatedAppointment.professionals.crm_cro : ''}
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
          ${record.professionals ? `
            <div class="signature-section">
              <div class="signature-line"></div>
              <div class="signature-name">Dr(a). ${record.professionals.name}</div>
              ${record.professionals.crm_cro ? `<div class="signature-crm">CRM: ${record.professionals.crm_cro}</div>` : ''}
            </div>
          ` : ''}
          
          <!-- Rodapé -->
          <div class="document-footer">
            <div class="footer-validity">
              VALIDADE: Este documento tem validade legal conforme CFO. Gerado em ${format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })}.
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
              Sistema de Prontuário Eletrônico | Prontuário: ${record.shortId} | Registro: ${format(new Date(record.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;
}
