
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, change, className = '' }: StatsCardProps) {
  return (
    <Card className={`h-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 leading-tight">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 leading-tight break-words">
          {value}
        </div>
        {change && (
          <p className={`text-xs mt-1 ${
            change.type === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}% desde o mês passado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
