import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { applyCpfMask } from '@/components/Patients/utils/inputMasks';

interface PersonalData {
  full_name: string;
  email: string;
  cpf: string;
}

export function PersonalDataSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<PersonalData>({
    full_name: '',
    email: '',
    cpf: ''
  });

  useEffect(() => {
    if (user) {
      fetchPersonalData();
    }
  }, [user]);

  const fetchPersonalData = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('full_name, email, cpf')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profileData) {
        setData({
          full_name: profileData.full_name || '',
          email: profileData.email || user?.email || '',
          cpf: profileData.cpf || ''
        });
      }
    } catch (error) {
      console.error('Error fetching personal data:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: data.full_name,
          email: data.email,
          cpf: data.cpf
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: 'Sucesso',
        description: 'Dados pessoais salvos com sucesso',
      });
    } catch (error) {
      console.error('Error saving personal data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados pessoais',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleCpfChange = (value: string) => {
    const maskedValue = applyCpfMask(value);
    handleInputChange('cpf', maskedValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          Dados Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={data.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={data.cpf}
              onChange={(e) => handleCpfChange(e.target.value)}
              placeholder="000.000.000-00"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 sm:gap-0">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  fetchPersonalData();
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              Editar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
