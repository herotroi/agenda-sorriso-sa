
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface RevenueChartProps {
  data?: Array<{ name: string; value: number }>;
  selectedPeriod?: { year: number; month?: number | 'all'; day?: number | null };
}

export function RevenueChart({ data = [], selectedPeriod }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calcular crescimento percentual
  const currentPeriod = data[data.length - 1]?.value || 0;
  const previousPeriod = data[data.length - 2]?.value || 0;
  const growth = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;

  // Determinar o título baseado na seleção
  const getChartTitle = () => {
    if (!selectedPeriod) return 'Receita';
    
    if (selectedPeriod.day && selectedPeriod.month !== 'all' && typeof selectedPeriod.month === 'number') {
      const monthName = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('pt-BR', { month: 'long' });
      return `Receita por Hora - ${selectedPeriod.day}/${selectedPeriod.month}/${selectedPeriod.year}`;
    } else if (selectedPeriod.month !== 'all' && typeof selectedPeriod.month === 'number') {
      const monthName = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('pt-BR', { month: 'long' });
      return `Receita Diária - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${selectedPeriod.year}`;
    } else {
      return `Receita Mensal - ${selectedPeriod.year}`;
    }
  };

  const getPeriodLabel = () => {
    if (!selectedPeriod) return 'no período';
    
    if (selectedPeriod.day && selectedPeriod.month !== 'all') {
      return 'no dia';
    } else if (selectedPeriod.month !== 'all') {
      return 'no mês';
    } else {
      return 'no ano';
    }
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let displayLabel = label;
      
      if (selectedPeriod?.day && selectedPeriod.month !== 'all') {
        displayLabel = `${label}`;
      } else if (selectedPeriod?.month !== 'all' && typeof selectedPeriod?.month === 'number') {
        // Mês específico - label já é o dia
        const monthName = new Date(selectedPeriod.year, selectedPeriod.month - 1).toLocaleDateString('pt-BR', { month: 'long' });
        displayLabel = `Dia ${label} de ${monthName}`;
      } else {
        // Ano inteiro - label é DD/MM
        displayLabel = `${label}`;
      }
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{displayLabel}</p>
          <p className="text-base font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-4 bg-gradient-to-br from-background to-muted/20 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {getChartTitle()}
          </CardTitle>
          {growth !== 0 && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              growth > 0 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              <span>{growth > 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(growth).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {currentPeriod > 0 && (
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(currentPeriod)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              {getPeriodLabel()}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="pl-8 pr-4">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              dy={10}
              angle={selectedPeriod?.month === 'all' ? -45 : 0}
              textAnchor={selectedPeriod?.month === 'all' ? 'end' : 'middle'}
              height={selectedPeriod?.month === 'all' ? 60 : 30}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').replace(',00', '')}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              dx={-5}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 2, 
                stroke: 'hsl(var(--background))',
                r: 5
              }}
              activeDot={{ 
                r: 7, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 3,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {data.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                📊
              </div>
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
