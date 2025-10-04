import { PersonalDataSection } from '@/components/Configuracoes/PersonalDataSection';
import { CompanyDataSection } from '@/components/Configuracoes/CompanyDataSection';
import { PasswordChangeSection } from '@/components/Configuracoes/PasswordChangeSection';
import { CompanyLogoSection } from '@/components/Configuracoes/CompanyLogoSection';
import { IntegrationDataSection } from '@/components/Configuracoes/IntegrationDataSection';
import { AutomationContactSection } from '@/components/Configuracoes/AutomationContactSection';
import { CouponSection } from '@/components/Configuracoes/CouponSection';

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas configurações de conta e perfil</p>
      </div>

      <div className="grid gap-6">
        <PersonalDataSection />
        <PasswordChangeSection />
        <CompanyLogoSection />
        <CompanyDataSection />
        <IntegrationDataSection />
        <AutomationContactSection />
        <CouponSection />
      </div>
    </div>
  );
}
