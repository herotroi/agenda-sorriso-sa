import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TableSaveManagerProps {
  content: string;
  onSave: (content: string) => void;
  isEnabled?: boolean;
}

export function TableSaveManager({ content, onSave, isEnabled = true }: TableSaveManagerProps) {
  const { toast } = useToast();

  const detectAndSaveTables = useCallback(() => {
    if (!isEnabled || !content) return;

    const hasTable = content.includes('<table>') || content.includes('<td>') || content.includes('<th>');
    
    if (hasTable) {
      console.log('🔍 TableSaveManager: Table detected, forcing save');
      onSave(content);
      
      // Verify table was saved by checking content again after a delay
      setTimeout(() => {
        if (content.includes('<table>')) {
          console.log('✅ TableSaveManager: Table content verified as saved');
        }
      }, 500);
    }
  }, [content, onSave, isEnabled]);

  // Monitor content changes and save tables
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      detectAndSaveTables();
    }, 1000); // Delay to avoid too frequent saves

    return () => clearTimeout(timeoutId);
  }, [detectAndSaveTables]);

  // Keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        console.log('⌨️ TableSaveManager: Ctrl+S detected');
        detectAndSaveTables();
        toast({
          title: 'Conteúdo salvo',
          description: 'Tabelas e conteúdo foram salvos manualmente',
        });
      }
    };

    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [detectAndSaveTables, isEnabled, toast]);

  return null; // This component doesn't render anything
}