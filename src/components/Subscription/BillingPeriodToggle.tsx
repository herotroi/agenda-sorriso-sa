import { Badge } from '@/components/ui/badge';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

interface BillingPeriodToggleProps {
  value: 'monthly' | 'annual';
  onChange: (value: 'monthly' | 'annual') => void;
}

export function BillingPeriodToggle({ value, onChange }: BillingPeriodToggleProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Período de Cobrança:</span>
        {value === 'annual' && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            💰 Economize 2 meses
          </Badge>
        )}
      </div>
      
      <ToggleGroup.Root
        type="single"
        value={value}
        onValueChange={(newValue) => {
          if (newValue) onChange(newValue as 'monthly' | 'annual');
        }}
        className="inline-flex bg-muted rounded-lg p-1"
      >
        <ToggleGroup.Item
          value="monthly"
          className="px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground"
        >
          Mensal
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="annual"
          className="px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-muted-foreground hover:text-foreground"
        >
          Anual
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}
