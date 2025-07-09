
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ProcedureForm } from '@/components/Procedures/ProcedureForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Procedure {
  id: string;
  name: string;
  price: number;
  default_duration: number;
  description?: string;
  active: boolean;
}

export default function Procedimentos() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name');

      if (error) throw error;
      setProcedures(data || []);
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
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este procedimento?')) return;

    try {
      const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Procedimento excluído com sucesso',
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procedimentos</h1>
          <p className="text-gray-600">Gerencie os procedimentos da clínica</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Procedimento
        </Button>
      </div>

      <div className="grid gap-4">
        {procedures.map((procedure) => (
          <Card key={procedure.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{procedure.name}</h3>
                  <p className="text-gray-600 text-sm">{procedure.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Preço: R$ {procedure.price.toFixed(2)}</span>
                    <span>Duração: {procedure.default_duration} min</span>
                    <span className={`px-2 py-1 rounded ${procedure.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {procedure.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(procedure)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(procedure.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {procedures.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum procedimento cadastrado</p>
          </CardContent>
        </Card>
      )}

      <ProcedureForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        procedure={editingProcedure}
      />
    </div>
  );
}
