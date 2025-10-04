
import { useState, useEffect } from 'react';
import { SubscriptionFooter } from '@/components/ui/subscription-footer';
import { AgendaHeader } from '@/components/Agenda/AgendaHeader';
import { AgendaTabs } from '@/components/Agenda/AgendaTabs';
import { usePrintReport } from '@/components/Agenda/hooks/usePrintReport';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Agenda() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<{ statusId?: number; procedureId?: string }>({});
  const { handlePrint } = usePrintReport();
  const { subscriptionData } = useSubscriptionLimits();
  const [totalAppointments, setTotalAppointments] = useState(0);

  useEffect(() => {
    const fetchTotalAppointments = async () => {
      if (!user) return;
      
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      setTotalAppointments(count || 0);
    };

    fetchTotalAppointments();
  }, [user]);

  const onPrint = () => {
    // Para a aba de tabela, passar os filtros ativos
    if (activeTab === 'table') {
      handlePrint(activeTab, selectedDate, undefined, activeFilters);
    } else {
      handlePrint(activeTab, selectedDate);
    }
  };

  const handleFiltersChange = (filters: { statusId?: number; procedureId?: string }) => {
    setActiveFilters(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-40">
      <div className="space-y-3 sm:space-y-4 md:space-y-6 px-3 py-4 sm:px-4 sm:py-6 md:px-6">
        <AgendaHeader onPrint={onPrint} />
        <AgendaTabs
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Subscription Footer - fixo no final da página */}
      {subscriptionData && (
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <SubscriptionFooter
            subscriptionData={subscriptionData}
            currentCount={totalAppointments}
            maxCount={subscriptionData.limits.max_appointments}
            featureName="Agendamentos"
            canUseFeature={subscriptionData.canCreateAppointment}
          />
        </div>
      )}
    </div>
  );
}
