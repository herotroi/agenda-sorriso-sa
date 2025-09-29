
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, MapPin, Clock, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { applyCpfMask, applyPhoneMask } from '@/components/Patients/utils/inputMasks';
import { CompanyLogoSection } from './CompanyLogoSection';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
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

export function UserSettingsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
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
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          cpf: data.cpf || '',
          cnpj: data.cnpj || '',
          street: data.street || '',
          number: data.number || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
          zip_code: data.zip_code || '',
          working_hours_start: data.working_hours_start || '08:00',
          working_hours_end: data.working_hours_end || '18:00'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          cpf: profile.cpf,
          cnpj: profile.cnpj,
          street: profile.street,
          number: profile.number,
          neighborhood: profile.neighborhood,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          working_hours_start: profile.working_hours_start,
          working_hours_end: profile.working_hours_end
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: 'Sucesso',
        description: 'Configurações do usuário salvas com sucesso',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações do usuário',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const maskedValue = applyPhoneMask(value);
    handleInputChange('phone', maskedValue);
  };

  const handleCpfChange = (value: string) => {
    const maskedValue = applyCpfMask(value);
    handleInputChange('cpf', maskedValue);
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
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(00) 00000-0000"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={profile.cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={profile.cnpj}
                onChange={(e) => handleCnpjChange(e.target.value)}
                placeholder="00.000.000/0000-00"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <CompanyLogoSection />
      
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
                value={profile.zip_code}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="00000-000"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="street">Rua</Label>
              <Input
                id="street"
                value={profile.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={profile.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={profile.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={profile.state}
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
                value={profile.working_hours_start}
                onChange={(e) => handleInputChange('working_hours_start', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="working_hours_end">Horário de Término</Label>
              <Input
                id="working_hours_end"
                type="time"
                value={profile.working_hours_end}
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
                fetchUserProfile();
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
            Editar Perfil
          </Button>
        )}
      </div>
    </div>
  );
}
