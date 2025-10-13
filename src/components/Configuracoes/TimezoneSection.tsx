import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-5)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' },
  { value: 'America/Recife', label: 'Recife (UTC-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-3)' },
  { value: 'America/Belem', label: 'Belém (UTC-3)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (UTC-4)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (UTC-4)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (UTC-4)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (UTC-4)' },
];

export function TimezoneSection() {
  const [timezone, setTimezone] = useState<string>('America/Sao_Paulo');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadTimezone();
  }, [user]);

  const loadTimezone = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.timezone) {
        setTimezone(data.timezone);
      }
    } catch (error) {
      console.error('Error loading timezone:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ timezone })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Fuso horário atualizado',
        description: 'As configurações foram salvas com sucesso.',
      });

      // Recarregar a página para aplicar o novo timezone
      window.location.reload();
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o fuso horário.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Fuso Horário</CardTitle>
        </div>
        <CardDescription>
          Configure o fuso horário para exibição de datas e horários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuso Horário</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Selecione o fuso horário" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Hora atual: {new Date().toLocaleString('pt-BR', { timeZone: timezone })}
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Fuso Horário'}
        </Button>
      </CardContent>
    </Card>
  );
}
