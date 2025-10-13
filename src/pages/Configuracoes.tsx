import { PersonalDataSection } from '@/components/Configuracoes/PersonalDataSection';
import { CompanyDataSection } from '@/components/Configuracoes/CompanyDataSection';
import { PasswordChangeSection } from '@/components/Configuracoes/PasswordChangeSection';
import { CompanyLogoSection } from '@/components/Configuracoes/CompanyLogoSection';
import { IntegrationDataSection } from '@/components/Configuracoes/IntegrationDataSection';
import { AutomationContactSection } from '@/components/Configuracoes/AutomationContactSection';
import { CouponSection } from '@/components/Configuracoes/CouponSection';
import { TimezoneSection } from '@/components/Configuracoes/TimezoneSection';

export default function Configuracoes() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm sm:text-base text-gray-600">Gerencie suas configurações de conta e perfil</p>
      </div>

      <div className="grid gap-4 sm:gap-6 max-w-full">
        <PersonalDataSection />
        <PasswordChangeSection />
        <TimezoneSection />
        <CompanyLogoSection />
        <CompanyDataSection />
        <IntegrationDataSection />
        <AutomationContactSection />
        <CouponSection />
      </div>
    </div>
  );
}
