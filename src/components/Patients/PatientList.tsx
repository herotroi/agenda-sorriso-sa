
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Phone, Mail, Edit, Eye } from 'lucide-react';

const mockPatients = [
  {
    id: '1',
    fullName: 'João Silva Santos',
    phone: '(11) 99999-9999',
    email: 'joao@email.com',
    cpf: '123.456.789-00',
    lastVisit: '2024-01-10',
    status: 'ativo',
  },
  {
    id: '2',
    fullName: 'Maria Oliveira Costa',
    phone: '(11) 88888-8888',
    email: 'maria@email.com',
    cpf: '987.654.321-00',
    lastVisit: '2024-01-08',
    status: 'ativo',
  },
  {
    id: '3',
    fullName: 'Pedro Rodrigues Lima',
    phone: '(11) 77777-7777',
    email: '',
    cpf: '456.789.123-00',
    lastVisit: '2023-12-15',
    status: 'inativo',
  },
];

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients] = useState(mockPatients);

  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.cpf.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-600">Gerencie o cadastro de pacientes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Pacientes</CardTitle>
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-600">Nome Completo</th>
                  <th className="text-left p-4 font-medium text-gray-600">Contato</th>
                  <th className="text-left p-4 font-medium text-gray-600">CPF</th>
                  <th className="text-left p-4 font-medium text-gray-600">Última Consulta</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{patient.fullName}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-3 w-3 mr-1" />
                          {patient.phone}
                        </div>
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{patient.cpf}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={patient.status === 'ativo' ? 'default' : 'secondary'}
                      >
                        {patient.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
