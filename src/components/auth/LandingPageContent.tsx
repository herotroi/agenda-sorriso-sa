import React from 'react';
import { 
  Calendar, 
  Users, 
  FileText, 
  Heart, 
  BarChart3, 
  Clock, 
  Shield, 
  Bell,
  CreditCard,
  CheckCircle2,
  Star,
  Zap,
  Cloud,
  Lock,
  Smartphone,
  TrendingUp,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const LandingPageContent = () => {
  const mainFeatures = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Sistema completo de agendamento com visualização por dia, semana e mês. Arrastar e soltar para facilitar reagendamentos.",
      details: [
        "Múltiplos profissionais",
        "Bloqueio de horários",
        "Notificações automáticas",
        "Impressão de agenda"
      ]
    },
    {
      icon: Users,
      title: "Gestão de Pacientes",
      description: "Cadastro completo com histórico médico, documentos e fotos. Busca rápida e filtros avançados.",
      details: [
        "Cadastro ilimitado",
        "Upload de documentos",
        "Histórico completo",
        "Dados seguros"
      ]
    },
    {
      icon: Heart,
      title: "Prontuário Eletrônico",
      description: "Prontuário digital completo com CID-10, prescrições, evoluções e anexos de exames.",
      details: [
        "Editor de texto rico",
        "Códigos CID-10",
        "Anexar exames",
        "Histórico vitalício"
      ]
    },
    {
      icon: BarChart3,
      title: "Relatórios & Dashboard",
      description: "Análise completa do seu consultório com gráficos interativos e métricas em tempo real.",
      details: [
        "Receita mensal/diária",
        "Procedimentos realizados",
        "Taxa de ocupação",
        "Exportação de dados"
      ]
    },
    {
      icon: FileText,
      title: "Procedimentos",
      description: "Cadastre todos os procedimentos com valores, duração e profissionais responsáveis.",
      details: [
        "Valores personalizados",
        "Duração configurável",
        "Múltiplos profissionais",
        "Controle de estoque"
      ]
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Dados criptografados e conformidade com LGPD. Backup automático na nuvem.",
      details: [
        "Criptografia de ponta",
        "Backup automático",
        "LGPD compliant",
        "Autenticação segura"
      ]
    }
  ];

  const additionalFeatures = [
    { icon: Clock, text: "Horários flexíveis e turnos" },
    { icon: Bell, text: "Notificações em tempo real" },
    { icon: CreditCard, text: "Controle financeiro integrado" },
    { icon: Smartphone, text: "Acesso via web responsivo" },
    { icon: Cloud, text: "Armazenamento na nuvem" },
    { icon: Lock, text: "Proteção de dados LGPD" },
    { icon: TrendingUp, text: "Análise de crescimento" },
    { icon: Star, text: "Interface intuitiva" }
  ];

  const plans = [
    {
      id: 'free',
      title: 'Plano Gratuito',
      price: 'Gratuito',
      features: [
        '50 agendamentos',
        '10 pacientes',
        '1 profissional',
        '5 procedimentos',
        'Sem acesso ao prontuário',
      ],
    },
    {
      id: 'paid',
      title: 'Plano Profissional',
      price: 'A partir de R$ 45,00/mês',
      features: [
        'Agendamentos ilimitados',
        'Pacientes ilimitados',
        'Múltiplos profissionais',
        'Procedimentos ilimitados',
        'Acesso completo ao prontuário eletrônico',
        'Suporte prioritário',
      ],
      popular: true,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1.5">
            <Zap className="w-3 h-3 mr-2 inline" />
            Sistema Completo de Gestão
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Transforme a Gestão do Seu Consultório
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Sistema completo de gestão para clínicas e consultórios médicos e odontológicos. 
            Agenda, prontuário eletrônico, controle financeiro e muito mais em uma única plataforma.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Funcionalidades Principais</h2>
          <p className="text-muted-foreground text-lg">
            Tudo que você precisa para gerenciar seu consultório de forma profissional
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="relative inline-block mb-3">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
                  <feature.icon className="h-12 w-12 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">E Muito Mais</h2>
          <p className="text-muted-foreground text-lg">
            Recursos adicionais para otimizar seu dia a dia
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={feature.text}
              className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 blur-lg rounded-full" />
                <feature.icon className="h-5 w-5 text-primary relative z-10" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="space-y-8 py-16 px-4 bg-muted/30">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Planos Disponíveis</h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o seu consultório. <strong>Cadastre-se para começar!</strong>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center py-6 bg-muted/30 rounded-lg">
                  <div className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4 text-center text-sm text-muted-foreground border-t">
                  Faça seu cadastro para contratar este plano
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pronto para Começar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cadastre-se agora e comece a transformar a gestão do seu consultório. 
            Sem cartão de crédito necessário para o plano gratuito.
          </p>
        </div>
      </section>

      {/* Footer Info */}
      <section className="border-t pt-8">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center justify-center md:justify-start gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Segurança
            </h3>
            <p className="text-sm text-muted-foreground">
              Dados criptografados e protegidos. Conformidade com LGPD e normas de segurança médica.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center justify-center md:justify-start gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Na Nuvem
            </h3>
            <p className="text-sm text-muted-foreground">
              Acesse de qualquer lugar, a qualquer hora. Backup automático e sincronização em tempo real.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center justify-center md:justify-start gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Responsivo
            </h3>
            <p className="text-sm text-muted-foreground">
              Interface adaptada para desktop, tablet e smartphone. Trabalhe de onde estiver.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};