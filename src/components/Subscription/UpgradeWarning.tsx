
import { AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface UpgradeWarningProps {
  title: string;
  description: string;
  feature: string;
  currentUsage?: number;
  maxLimit?: number;
}

export function UpgradeWarning({ 
  title, 
  description, 
  feature,
  currentUsage,
  maxLimit 
}: UpgradeWarningProps) {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {currentUsage !== undefined && maxLimit !== undefined && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Uso Atual: {feature}
            </p>
            <div className="flex justify-center items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{currentUsage}</span>
              <span className="text-gray-500">/</span>
              <span className="text-lg text-gray-600">{maxLimit}</span>
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Planos Pagos</span>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Agendamentos ilimitados</li>
            <li>✓ Pacientes ilimitados</li>
            <li>✓ Profissionais ilimitados</li>
            <li>✓ Procedimentos ilimitados</li>
            <li>✓ Acesso ao prontuário eletrônico</li>
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          onClick={() => navigate('/assinatura')} 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Ver Planos e Fazer Upgrade
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="w-full"
        >
          Voltar
        </Button>
      </CardFooter>
    </Card>
  );
}
