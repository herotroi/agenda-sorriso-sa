
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Mail, Phone } from 'lucide-react';
import { ProfessionalForm } from './ProfessionalForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Professional {
  id: string;
  name: string;
  specialty?: string;
  crm_cro?: string;
  email?: string;
  phone?: string;
  color: string;
  working_hours: any;
  active: boolean;
}

export function ProfessionalList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name');

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar profissionais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProfessional(null);
    fetchProfessionals();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600">Gerencie os profissionais da clínica</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Profissional
        </Button>
      </div>

      <div className="grid gap-4">
        {professionals.map((professional) => (
          <Card key={professional.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: professional.color }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{professional.name}</h3>
                    <div className="space-y-1">
                      {professional.specialty && (
                        <p className="text-sm text-gray-600">
                          Especialidade: {professional.specialty}
                        </p>
                      )}
                      {professional.crm_cro && (
                        <p className="text-sm text-gray-600">
                          CRM/CRO: {professional.crm_cro}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {professional.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {professional.email}
                          </div>
                        )}
                        {professional.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {professional.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Expediente: {professional.working_hours?.start || '08:00'} - {professional.working_hours?.end || '18:00'}
                        </span>
                        <span className={`px-2 py-1 rounded ${professional.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {professional.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(professional)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum profissional cadastrado</p>
          </CardContent>
        </Card>
      )}

      <ProfessionalForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        professional={editingProfessional}
      />
    </div>
  );
}
