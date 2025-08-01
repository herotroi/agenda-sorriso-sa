
import { UserSettingsSection } from '@/components/Configuracoes/UserSettingsSection';
import { PasswordChangeSection } from '@/components/Configuracoes/PasswordChangeSection';
import { CouponSection } from '@/components/Configuracoes/CouponSection';

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas configurações de conta e perfil</p>
      </div>

      <div className="grid gap-6">
        <UserSettingsSection />
        <PasswordChangeSection />
        <CouponSection />
      </div>
    </div>
  );
}
