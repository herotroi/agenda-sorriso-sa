
import { ProfessionalList } from '@/components/Professionals/ProfessionalList';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

export default function Profissionais() {
  const { subscriptionData, loading } = useSubscriptionLimits();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <ProfessionalList />;
}
