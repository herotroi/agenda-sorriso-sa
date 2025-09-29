import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Database, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function IntegrationDataSection() {
  const { user } = useAuth();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência!`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Dados para Integração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">ID do Usuário</span>
            <Badge variant="secondary" className="text-xs">
              Único
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono text-gray-800">
              {user?.id || 'Não disponível'}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(user?.id || '', 'ID do usuário')}
              disabled={!user?.id}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use este ID para integrações com sistemas externos e APIs
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Importante:</strong> Este ID é único e permanente para sua conta. 
            Mantenha-o seguro e use apenas em integrações confiáveis.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}