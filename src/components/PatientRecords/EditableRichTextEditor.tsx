import React, { useCallback, useState, useEffect } from 'react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableRichTextEditorProps {
  label: string;
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export function EditableRichTextEditor({ 
  label, 
  content, 
  onChange, 
  onSave, 
  placeholder, 
  icon,
  loading = false 
}: EditableRichTextEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Sync with external content changes
  useEffect(() => {
    if (content !== localContent && !hasLocalChanges) {
      console.log(`📝 ${label}: Syncing external content change`);
      setLocalContent(content);
    }
  }, [content, localContent, hasLocalChanges, label]);

  const handleContentChange = useCallback((newContent: string) => {
    console.log(`📝 ${label}: Content changed, length:`, newContent.length);
    setLocalContent(newContent);
    setHasLocalChanges(true);
    
    // Call external onChange immediately for form state sync
    onChange(newContent);
  }, [onChange, label]);

  const handleManualSave = useCallback(async () => {
    if (!hasLocalChanges) return;
    
    console.log(`💾 ${label}: Manual save triggered`);
    setIsSaving(true);
    
    try {
      // Ensure content is synced
      onChange(localContent);
      
      // Call external save if provided
      if (onSave) {
        await onSave();
      }
      
      setHasLocalChanges(false);
      
      toast({
        title: 'Conteúdo salvo',
        description: `${label} foi salvo com sucesso`,
      });
    } catch (error) {
      console.error(`❌ ${label}: Save error:`, error);
      toast({
        title: 'Erro ao salvar',
        description: `Erro ao salvar ${label.toLowerCase()}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }, [hasLocalChanges, localContent, onChange, onSave, label, toast]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-base font-medium">{label}</span>
        </div>
        
        {hasLocalChanges && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>Alterações não salvas</span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || loading}
              className="h-7 px-2 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>
      
      <div className="border border-input rounded-lg overflow-hidden">
        {loading && (
          <div className="p-2 bg-blue-50 border-b text-xs text-blue-700 flex items-center gap-2">
            <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
            Carregando {label.toLowerCase()}...
          </div>
        )}
        
        <RichTextEditor
          content={localContent}
          onChange={handleContentChange}
          onManualSave={handleManualSave}
          placeholder={placeholder}
          debounceDelay={3000} // Longer delay for manual save scenarios
        />
      </div>
      
      {hasLocalChanges && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>Use o botão "Salvar" acima para salvar suas alterações, especialmente após editar tabelas</span>
        </div>
      )}
    </div>
  );
}