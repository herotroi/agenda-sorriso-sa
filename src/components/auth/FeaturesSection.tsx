
import React from 'react';
import { Calendar, Users, FileText, Heart, BarChart3 } from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
      <div className="text-center p-4">
        <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Agenda Inteligente</h3>
        <p className="text-sm text-gray-600">Agendamento otimizado e inteligente</p>
      </div>
      <div className="text-center p-4">
        <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Múltiplos Profissionais</h3>
        <p className="text-sm text-gray-600">Gestão de equipe médica completa</p>
      </div>
      <div className="text-center p-4">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Cadastro Ilimitado</h3>
        <p className="text-sm text-gray-600">Pacientes e profissionais sem limite</p>
      </div>
      <div className="text-center p-4">
        <Heart className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Prontuário Eletrônico</h3>
        <p className="text-sm text-gray-600">Histórico médico digitalizado</p>
      </div>
      <div className="text-center p-4">
        <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Dashboard Interativo</h3>
        <p className="text-sm text-gray-600">Relatórios e métricas em tempo real</p>
      </div>
    </div>
  );
};
