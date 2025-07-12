
import { ProfessionalList } from '@/components/Professionals/ProfessionalList';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradeWarning } from '@/components/Subscription/UpgradeWarning';

export default function Profissionais() {
  const { subscriptionData, loading } = useSubscriptionLimits();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar se o usuário pode criar profissionais
  if (subscriptionData && !subscriptionData.canCreateProfessional) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <UpgradeWarning
            title="Limite de Profissionais Atingido"
            description="Você atingiu o limite máximo de profissionais para o seu plano atual."
            feature="Profissionais"
            currentUsage={subscriptionData.usage.professionals_count}
            maxLimit={subscriptionData.limits.max_professionals}
          />
        </div>
      </div>
    );
  }

  return <ProfessionalList />;
}
