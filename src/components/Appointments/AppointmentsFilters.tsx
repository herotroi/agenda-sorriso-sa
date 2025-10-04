
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentsFiltersProps {
  onFiltersChange: (filters: { statusId?: number; procedureId?: string }) => void;
}

export function AppointmentsFilters({ onFiltersChange }: AppointmentsFiltersProps) {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');

  useEffect(() => {
    fetchFilterData();
  }, []);

  useEffect(() => {
    const filters: { statusId?: number; procedureId?: string } = {};
    
    if (selectedStatus && selectedStatus !== 'all') {
      filters.statusId = parseInt(selectedStatus);
    }
    
    if (selectedProcedure && selectedProcedure !== 'all') {
      filters.procedureId = selectedProcedure;
    }
    
    onFiltersChange(filters);
  }, [selectedStatus, selectedProcedure, onFiltersChange]);

  const fetchFilterData = async () => {
    try {
      // Fetch statuses
      const { data: statusesData } = await supabase
        .from('appointment_statuses')
        .select('*')
        .eq('active', true)
        .order('label');

      // Fetch procedures
      const { data: proceduresData } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true)
        .order('name');

      setStatuses(statusesData || []);
      setProcedures(proceduresData || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedProcedure('');
  };

  const hasActiveFilters = selectedStatus || selectedProcedure;

  return (
    <Card>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <span className="text-sm sm:text-base font-medium">Filtros:</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 flex-1">
            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial sm:min-w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 sm:h-10">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: status.color }}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Procedure Filter */}
            <div className="flex-1 sm:flex-initial sm:min-w-[200px]">
              <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                <SelectTrigger className="h-11 sm:h-10">
                  <SelectValue placeholder="Todos os procedimentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os procedimentos</SelectItem>
                  {procedures.map((procedure) => (
                    <SelectItem key={procedure.id} value={procedure.id}>
                      {procedure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="default"
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[40px] w-full sm:w-auto"
              >
                <X className="h-4 w-4" />
                <span>Limpar Filtros</span>
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {selectedStatus && selectedStatus !== 'all' && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Status: {statuses.find(s => s.id.toString() === selectedStatus)?.label}
                </div>
              )}
              {selectedProcedure && selectedProcedure !== 'all' && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  Procedimento: {procedures.find(p => p.id === selectedProcedure)?.name}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
