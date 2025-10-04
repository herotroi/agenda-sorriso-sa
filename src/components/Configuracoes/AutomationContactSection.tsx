import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Bot, ExternalLink } from 'lucide-react';

export function AutomationContactSection() {
  const openWhatsApp = () => {
    window.open('https://wa.me/5555996806688?text=Olá! Gostaria de saber mais sobre automação de atendimento para minha clínica.', '_blank');
  };

  const openInstagram = () => {
    window.open('https://instagram.com/herotroiautomacoes', '_blank');
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-blue-50 max-w-full overflow-x-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Bot className="h-5 w-5" />
          Automação de Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            Quer automatizar o atendimento da sua clínica?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Entre em contato com a <strong>Herotroi Automações</strong> e descubra como 
            podemos integrar chatbots e automações personalizadas ao seu sistema.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={openWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
            >
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">WhatsApp: (55) 9 9680-6688</span>
              <ExternalLink className="h-4 w-4 ml-1 sm:ml-2 flex-shrink-0" />
            </Button>
            
            <Button 
              onClick={openInstagram}
              variant="outline"
              className="flex-1 border-pink-300 text-pink-700 hover:bg-pink-50 text-xs sm:text-sm"
            >
              <Instagram className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="truncate">@herotroiautomacoes</span>
              <ExternalLink className="h-4 w-4 ml-1 sm:ml-2 flex-shrink-0" />
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Bot className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Benefícios da automação:</strong> Atendimento 24/7, agendamentos automáticos, 
              lembretes de consulta, e muito mais!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}