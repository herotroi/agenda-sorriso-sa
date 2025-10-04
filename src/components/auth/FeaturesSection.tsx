
import React from 'react';
import { Calendar, Users, FileText, Heart, BarChart3 } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Agendamento otimizado e inteligente"
    },
    {
      icon: Users,
      title: "Múltiplos Profissionais",
      description: "Gestão de equipe médica completa"
    },
    {
      icon: FileText,
      title: "Cadastro Ilimitado",
      description: "Pacientes e profissionais sem limite"
    },
    {
      icon: Heart,
      title: "Prontuário Eletrônico",
      description: "Histórico médico digitalizado"
    },
    {
      icon: BarChart3,
      title: "Dashboard Interativo",
      description: "Relatórios e métricas em tempo real"
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
      {features.map((feature, index) => (
        <div 
          key={feature.title}
          className="group text-center p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
            <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{feature.title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};
