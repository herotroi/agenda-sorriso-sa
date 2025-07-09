
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Calendar, User } from 'lucide-react';

const mockProfessionals = [
  {
    id: '1',
    name: 'Dr. João Silva',
    specialty: 'Ortodontia',
    cro: 'CRO-SP 12345',
    email: 'joao.silva@clinica.com',
    phone: '(11) 99999-9999',
    calendarColor: '#10b981',
    isActive: true,
    services: ['Aparelho Ortodôntico', 'Manutenção', 'Consulta'],
  },
  {
    id: '2',
    name: 'Dra. Maria Costa',
    specialty: 'Endodontia',
    cro: 'CRO-SP 67890',
    email: 'maria.costa@clinica.com',
    phone: '(11) 88888-8888',
    calendarColor: '#f59e0b',
    isActive: true,
    services: ['Tratamento de Canal', 'Obturação'],
  },
  {
    id: '3',
    name: 'Dr. Pedro Santos',
    specialty: 'Cirurgia',
    cro: 'CRO-SP 11111',
    email: 'pedro.santos@clinica.com',
    phone: '(11) 77777-7777',
    calendarColor: '#ef4444',
    isActive: false,
    services: ['Extração', 'Implante', 'Cirurgia Oral'],
  },
];

export function ProfessionalList() {
  const [professionals, setProfessionals] = useState(mockProfessionals);

  const toggleProfessionalStatus = (id: string) => {
    setProfessionals(professionals.map(prof => 
      prof.id === id ? { ...prof, isActive: !prof.isActive } : prof
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Profissionais</h2>
          <p className="text-gray-600">Gerencie os profissionais da clínica</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: professional.calendarColor }}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{professional.name}</CardTitle>
                    <p className="text-sm text-gray-600">{professional.specialty}</p>
                  </div>
                </div>
                <Switch
                  checked={professional.isActive}
                  onCheckedChange={() => toggleProfessionalStatus(professional.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">CRO:</span> {professional.cro}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {professional.email}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Telefone:</span> {professional.phone}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Serviços:</p>
                <div className="flex flex-wrap gap-1">
                  {professional.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Agenda
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>

              <div className="flex items-center justify-center pt-2">
                <Badge 
                  variant={professional.isActive ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {professional.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
