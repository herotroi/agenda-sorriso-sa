import { useState, useEffect } from 'react';
import { SubscriptionFooter } from '@/components/ui/subscription-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { ProcedureForm } from '@/components/Procedures/ProcedureForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { UpgradeWarning } from '@/components/Subscription/UpgradeWarning';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  description?: string;
  active: boolean;
}

interface ProcedureWithProfessionals extends Procedure {
  professionals: {
    id: string;
    name: string;
    specialty?: string;
  }[];
}

export default function Procedimentos() {
  const [procedures, setProcedures] = useState<ProcedureWithProfessionals[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { subscriptionData, loading: subscriptionLoading, checkLimit, showLimitWarning } = useSubscriptionLimits();

  const fetchProcedures = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Buscar procedimentos
      const { data: proceduresData, error: proceduresError } = await supabase
        .from('procedures')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (proceduresError) throw proceduresError;

      // Buscar profissionais associados a cada procedimento
      const proceduresWithProfessionals = await Promise.all(
        (proceduresData || []).map(async (procedure) => {
          const { data: professionalsData, error: professionalsError } = await supabase
            .from('procedure_professionals')
            .select(`
              professional:professionals(id, name, specialty)
            `)
            .eq('procedure_id', procedure.id)
            .eq('user_id', user.id);

          if (professionalsError) {
            console.error('Error fetching professionals for procedure:', professionalsError);
            return { ...procedure, professionals: [] };
          }

          return {
            ...procedure,
            professionals: professionalsData?.map(item => item.professional).filter(Boolean) || []
          };
        })
      );

      setProcedures(proceduresWithProfessionals);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar procedimentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, [user]);

  const handleDelete = async (id: string, name: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `Procedimento ${name} excluído com sucesso`,
      });
      
      fetchProcedures();
    } catch (error) {
      console.error('Error deleting procedure:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir procedimento',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProcedure(null);
    fetchProcedures();
  };

  const handleNewProcedure = () => {
    if (!checkLimit('procedure')) {
      showLimitWarning('procedure');
      return;
    }
    setIsFormOpen(true);
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar se o usuário pode criar procedimentos
  if (subscriptionData && !subscriptionData.canCreateProcedure && procedures.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <UpgradeWarning
            title="Limite de Procedimentos Atingido"
            description="Você atingiu o limite máximo de procedimentos para o seu plano atual."
            feature="Procedimentos"
            currentUsage={subscriptionData.usage.procedures_count}
            maxLimit={subscriptionData.limits.max_procedures}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Procedimentos</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie os procedimentos da clínica</p>
          {subscriptionData && subscriptionData.plan_type === 'free' && (
            <p className="text-xs sm:text-sm text-amber-600 mt-1">
              Plano gratuito: {subscriptionData.usage.procedures_count}/{subscriptionData.limits.max_procedures} procedimentos
            </p>
          )}
        </div>
        <Button onClick={handleNewProcedure} className="w-full sm:w-auto whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          Novo Procedimento
        </Button>
      </div>

      <div className="grid gap-4">
        {procedures.map((procedure) => (
          <Card key={procedure.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">{procedure.name}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{procedure.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="whitespace-nowrap">Preço: R$ {procedure.price.toFixed(2)}</span>
                    <span className="whitespace-nowrap">Duração: {procedure.default_duration} min</span>
                    <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${procedure.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {procedure.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {procedure.professionals.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Profissionais Responsáveis:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {procedure.professionals.map((professional) => (
                          <Badge key={professional.id} variant="secondary" className="text-xs">
                            {professional.name}
                            {professional.specialty && (
                              <span className="ml-1 opacity-75">
                                ({professional.specialty})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {procedure.professionals.length === 0 && (
                    <div className="mt-3 text-xs sm:text-sm text-amber-600 bg-amber-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded">
                      Nenhum profissional responsável definido
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(procedure)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="ml-2 sm:hidden">Editar</span>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="ml-2 sm:hidden">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o procedimento <strong>{procedure.name}</strong>? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(procedure.id, procedure.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {procedures.length === 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-gray-500">Nenhum procedimento cadastrado</p>
          </CardContent>
        </Card>
      )}

      <ProcedureForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        procedure={editingProcedure}
      />

      {/* Subscription Footer */}
      {subscriptionData && (
        <SubscriptionFooter
          subscriptionData={subscriptionData}
          currentCount={procedures.length}
          maxCount={subscriptionData.limits.max_procedures}
          featureName="Procedimentos"
          canUseFeature={subscriptionData.canCreateProcedure}
        />
      )}
    </div>
  );
}
