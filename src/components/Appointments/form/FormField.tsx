
import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  required?: boolean;
  currentValue?: string;
  children: ReactNode;
}

export function FormField({ label, required, currentValue, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
        {currentValue && (
          <span className="text-xs text-muted-foreground font-normal ml-2">
            (Atual: {currentValue})
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}
