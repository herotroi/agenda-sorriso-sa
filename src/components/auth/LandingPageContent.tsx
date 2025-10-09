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
  TrendingUp
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
      name: "Free",
      price: "Grátis",
      period: "para sempre",
      description: "Ideal para começar",
      features: [
        "10 agendamentos/mês",
        "3 pacientes",
        "1 profissional",
        "3 procedimentos",
        "Dashboard básico",
        "Suporte por email"
      ],
      highlight: false
    },
    {
      name: "Professional",
      price: "R$ 49,90",
      period: "/mês",
      description: "Para consultórios em crescimento",
      features: [
        "150 agendamentos/mês",
        "50 pacientes",
        "3 profissionais",
        "Procedimentos ilimitados",
        "Prontuário eletrônico completo",
        "Relatórios avançados",
        "Notificações automáticas",
        "Suporte prioritário"
      ],
      highlight: true,
      badge: "Mais Popular"
    },
    {
      name: "Premium",
      price: "R$ 99,90",
      period: "/mês",
      description: "Para clínicas completas",
      features: [
        "Agendamentos ilimitados",
        "Pacientes ilimitados",
        "Profissionais ilimitados",
        "Procedimentos ilimitados",
        "Prontuário eletrônico completo",
        "Todos os relatórios",
        "Automação de mensagens",
        "Integração WhatsApp",
        "Backup diário",
        "Suporte 24/7"
      ],
      highlight: false,
      badge: "Completo"
    }
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
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">Planos e Preços</h2>
          <p className="text-muted-foreground text-lg">
            Escolha o plano ideal para o seu consultório
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.highlight 
                  ? 'border-primary shadow-xl scale-105 lg:scale-110' 
                  : 'border-border/50'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-4xl font-bold text-primary">
                    {plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>
                <CardDescription className="text-base pt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
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