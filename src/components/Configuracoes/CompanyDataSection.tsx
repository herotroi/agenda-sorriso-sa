import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { applyPhoneMask } from '@/components/Patients/utils/inputMasks';

interface CompanyData {
  phone: string;
  cnpj: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  working_hours_start: string;
  working_hours_end: string;
}

export function CompanyDataSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<CompanyData>({
    phone: '',
    cnpj: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    working_hours_start: '08:00',
    working_hours_end: '18:00'
  });

  useEffect(() => {
    if (user) {
      fetchCompanyData();
    }
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('phone, cnpj, street, number, neighborhood, city, state, zip_code, working_hours_start, working_hours_end')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profileData) {
        setData({
          phone: profileData.phone || '',
          cnpj: profileData.cnpj || '',
          street: profileData.street || '',
          number: profileData.number || '',
          neighborhood: profileData.neighborhood || '',
          city: profileData.city || '',
          state: profileData.state || '',
          zip_code: profileData.zip_code || '',
          working_hours_start: profileData.working_hours_start || '08:00',
          working_hours_end: profileData.working_hours_end || '18:00'
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
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
          phone: data.phone,
          cnpj: data.cnpj,
          street: data.street,
          number: data.number,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zip_code: data.zip_code,
          working_hours_start: data.working_hours_start,
          working_hours_end: data.working_hours_end
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: 'Sucesso',
        description: 'Dados da empresa salvos com sucesso',
      });
    } catch (error) {
      console.error('Error saving company data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar dados da empresa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const maskedValue = applyPhoneMask(value);
    handleInputChange('phone', maskedValue);
  };

  const handleCnpjChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const maskedValue = numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    handleInputChange('cnpj', maskedValue);
  };

  const handleZipCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const maskedValue = numericValue.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    handleInputChange('zip_code', maskedValue);
  };

  return (
    <div className="space-y-6">
      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={data.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="00.000.000/0000-00"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={data.zip_code}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="00000-000"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={data.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={data.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={data.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={data.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={data.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horário de Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horário de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="working_hours_start">Horário de Início</Label>
              <Input
                id="working_hours_start"
                type="time"
                value={data.working_hours_start}
                onChange={(e) => handleInputChange('working_hours_start', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="working_hours_end">Horário de Término</Label>
              <Input
                id="working_hours_end"
                type="time"
                value={data.working_hours_end}
                onChange={(e) => handleInputChange('working_hours_end', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                fetchCompanyData();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </div>
    </div>
  );
}
