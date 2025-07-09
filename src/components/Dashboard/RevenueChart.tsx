
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 4800 },
  { name: 'Fev', value: 5200 },
  { name: 'Mar', value: 4900 },
  { name: 'Abr', value: 6100 },
  { name: 'Mai', value: 5800 },
  { name: 'Jun', value: 6400 },
  { name: 'Jul', value: 7200 },
  { name: 'Ago', value: 6800 },
  { name: 'Set', value: 7500 },
  { name: 'Out', value: 8100 },
  { name: 'Nov', value: 7800 },
  { name: 'Dez', value: 8500 },
];

export function RevenueChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Receita Mensal</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Receita']}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
