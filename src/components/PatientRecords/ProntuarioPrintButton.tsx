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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #333;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid #2563eb;
        }
        
        .header h1 {
          color: #1e40af;
          font-size: 24pt;
          margin-bottom: 5px;
        }
        
        .header .company-info {
          font-size: 10pt;
          color: #666;
          margin-top: 5px;
        }
        
        .patient-info {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #2563eb;
        }
        
        .patient-info h2 {
          color: #1e40af;
          font-size: 14pt;
          margin-bottom: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          font-size: 10pt;
        }
        
        .info-item {
          display: flex;
        }
        
        .info-label {
          font-weight: 600;
          margin-right: 5px;
          color: #475569;
        }
        
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        
        .section-title {
          color: #1e40af;
          font-size: 13pt;
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .stat-card {
          background: #f1f5f9;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 18pt;
          font-weight: 700;
          color: #2563eb;
        }
        
        .stat-label {
          font-size: 9pt;
          color: #64748b;
          margin-top: 3px;
        }
        
        .record-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .record-title {
          font-size: 12pt;
          font-weight: 700;
          color: #1e3a8a;
        }
        
        .record-date {
          font-size: 9pt;
          color: #64748b;
        }
        
        .record-content {
          margin-top: 10px;
          font-size: 10pt;
          line-height: 1.5;
        }
        
        .subsection {
          margin-top: 10px;
        }
        
        .subsection-title {
          font-size: 10pt;
          font-weight: 600;
          color: #475569;
          margin-bottom: 5px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 9pt;
        }
        
        th {
          background-color: #f1f5f9;
          color: #1e40af;
          font-weight: 600;
          text-align: left;
          padding: 8px;
          border: 1px solid #cbd5e1;
        }
        
        td {
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
        }
        
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 8pt;
          font-weight: 600;
          margin-right: 5px;
          margin-bottom: 3px;
        }
        
        .badge-blue {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .badge-purple {
          background-color: #e9d5ff;
          color: #6b21a8;
        }
        
        .badge-green {
          background-color: #dcfce7;
          color: #15803d;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          font-size: 8pt;
          color: #94a3b8;
        }
        
        @media print {
          body {
            padding: 15px;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho -->
      <div class="header">
        <h1>Prontuário Médico Completo</h1>
        ${profile?.company_name ? `<div class="company-info">${profile.company_name}</div>` : ''}
        ${profile?.phone ? `<div class="company-info">Tel: ${profile.phone}</div>` : ''}
        <div class="company-info">Gerado em: ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
      </div>

      <!-- Dados do Paciente -->
      <div class="patient-info">
        <h2>Dados do Paciente</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nome:</span>
            <span>${patient.full_name}</span>
          </div>
          ${patient.cpf ? `
            <div class="info-item">
              <span class="info-label">CPF:</span>
              <span>${patient.cpf}</span>
            </div>
          ` : ''}
          ${patient.birth_date ? `
            <div class="info-item">
              <span class="info-label">Data Nasc:</span>
              <span>${format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          ` : ''}
          ${patient.phone ? `
            <div class="info-item">
              <span class="info-label">Telefone:</span>
              <span>${patient.phone}</span>
            </div>
          ` : ''}
          ${patient.email ? `
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span>${patient.email}</span>
            </div>
          ` : ''}
          ${patient.gender ? `
            <div class="info-item">
              <span class="info-label">Gênero:</span>
              <span>${patient.gender}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Resumo Geral -->
      <div class="section">
        <h2 class="section-title">📊 Resumo Geral</h2>
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-value">${records.length}</div>
            <div class="stat-label">Registros Médicos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${appointments.length}</div>
            <div class="stat-label">Consultas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${documents.length}</div>
            <div class="stat-label">Documentos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${icdCodes.length}</div>
            <div class="stat-label">Códigos CID</div>
          </div>
        </div>
      </div>

      <!-- Histórico de Consultas -->
      ${appointments.length > 0 ? `
        <div class="section">
          <h2 class="section-title">📅 Histórico de Consultas</h2>
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Profissional</th>
                <th>Procedimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${appointments.map(apt => `
                <tr>
                  <td>${format(new Date(apt.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</td>
                  <td>${apt.professionals?.name || '-'}</td>
                  <td>${apt.procedures?.name || '-'}</td>
                  <td>${apt.appointment_statuses?.label || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Códigos CID Consolidados -->
      ${icdCodes.length > 0 ? `
        <div class="section">
          <h2 class="section-title">🏥 Códigos CID Consolidados</h2>
          <div style="margin-top: 10px;">
            ${icdCodes.map(icd => `
              <span class="badge ${icd.version === 'CID-10' ? 'badge-purple' : 'badge-blue'}">
                ${icd.code} - ${icd.version}${icd.title ? ': ' + icd.title : ''}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Registros Médicos Detalhados -->
      ${records.length > 0 ? `
        <div class="section page-break">
          <h2 class="section-title">📋 Registros Médicos Detalhados</h2>
          ${records.map((record, index) => {
            // Buscar consultas vinculadas a este registro
            const recordAppointments = appointments.filter(apt => 
              record.appointments?.id === apt.id
            );

            // Buscar CIDs deste registro
            let recordIcds: any[] = [];
            if (record.icd_codes) {
              try {
                recordIcds = typeof record.icd_codes === 'string' 
                  ? JSON.parse(record.icd_codes) 
                  : record.icd_codes;
              } catch (e) {}
            }

            return `
              <div class="record-card ${index > 0 ? 'page-break' : ''}">
                <div class="record-header">
                  <div>
                    <div class="record-title">${record.title || 'Registro sem título'}</div>
                    ${record.professionals ? `<div style="font-size: 9pt; color: #64748b; margin-top: 3px;">Dr(a). ${record.professionals.name}${record.professionals.specialty ? ' - ' + record.professionals.specialty : ''}</div>` : ''}
                  </div>
                  <div class="record-date">${format(new Date(record.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                </div>

                ${recordIcds.length > 0 ? `
                  <div class="subsection">
                    <div class="subsection-title">Diagnósticos (CID):</div>
                    ${recordIcds.map(icd => `
                      <span class="badge ${icd.version === 'CID-10' ? 'badge-purple' : 'badge-blue'}">
                        ${icd.code}${icd.title ? ' - ' + icd.title : ''}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}

                ${record.content ? `
                  <div class="subsection">
                    <div class="subsection-title">Anamnese/Evolução:</div>
                    <div class="record-content">${record.content}</div>
                  </div>
                ` : ''}

                ${record.notes ? `
                  <div class="subsection">
                    <div class="subsection-title">Observações:</div>
                    <div class="record-content">${record.notes}</div>
                  </div>
                ` : ''}

                ${record.prescription ? `
                  <div class="subsection">
                    <div class="subsection-title">Prescrição Médica:</div>
                    <div class="record-content">${record.prescription}</div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      <!-- Documentos -->
      ${documents.length > 0 ? `
        <div class="section">
          <h2 class="section-title">📎 Documentos Anexados</h2>
          <table>
            <thead>
              <tr>
                <th>Nome do Documento</th>
                <th>Descrição</th>
                <th>Tamanho</th>
                <th>Data de Upload</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map(doc => `
                <tr>
                  <td>${doc.name}</td>
                  <td>${doc.description || '-'}</td>
                  <td>${(doc.file_size / 1024).toFixed(1)} KB</td>
                  <td>${format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Rodapé -->
      <div class="footer">
        <p>Este é um documento médico confidencial. Deve ser tratado com sigilo e conforme a legislação vigente.</p>
        <p>Gerado automaticamente pelo sistema em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      </div>
    </body>
    </html>
  `;
}
