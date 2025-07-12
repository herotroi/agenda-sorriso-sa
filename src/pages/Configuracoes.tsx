
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSettingsSection } from '@/components/Configuracoes/UserSettingsSection';
import { PasswordChangeSection } from '@/components/Configuracoes/PasswordChangeSection';

export default function Configuracoes() {
  const [settings, setSettings] = useState({
    subscription_plan: 'monthly'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as any) || {};

      setSettings({
        subscription_plan: settingsMap.subscription_plan || 'monthly'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const update = {
        key: 'subscription_plan',
        value: settings.subscription_plan
      };

      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: update.key, 
          value: update.value 
        }, { 
          onConflict: 'key' 
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema e seu perfil</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações do Usuário */}
        <UserSettingsSection />

        {/* Alterar Senha */}
        <PasswordChangeSection />

        {/* Plano de Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Plano de Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subscription_plan">Plano Atual</Label>
              <Select 
                value={settings.subscription_plan} 
                onValueChange={(value) => setSettings({ ...settings, subscription_plan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensal - R$ 35/mês</SelectItem>
                  <SelectItem value="annual">Anual - R$ 30/mês</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {settings.subscription_plan === 'monthly' 
                  ? 'Plano Mensal ativo - Cobrança de R$ 35 todo mês'
                  : 'Plano Anual ativo - Cobrança de R$ 360 por ano (R$ 30/mês)'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
