import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Building2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CompanyLogoSection() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-logo.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      toast.success('Logo carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao carregar logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          company_logo: logoUrl,
          company_name: companyName,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Informações da empresa salvas!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar informações');
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Logo da Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="company-name">Nome da Empresa</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Digite o nome da sua empresa"
          />
        </div>

        <div>
          <Label htmlFor="logo-upload">Logo da Empresa</Label>
          <div className="mt-2">
            {logoUrl ? (
              <div className="relative inline-block">
                <img
                  src={logoUrl}
                  alt="Logo da empresa"
                  className="h-32 w-32 object-contain border rounded-lg bg-gray-50"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2"
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Carregar logo
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG até 2MB</p>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={isUploading}>
          <Save className="h-4 w-4 mr-2" />
          {isUploading ? 'Salvando...' : 'Salvar Informações'}
        </Button>
      </CardContent>
    </Card>
  );
}