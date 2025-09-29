import React from 'react';
import { cn } from '@/lib/utils';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  // Se o conteúdo contém tags HTML, renderiza como HTML
  if (content && content.includes('<')) {
    return (
      <div 
        className={cn("prose prose-sm max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          // Estilos customizados para melhor renderização do HTML
          lineHeight: '1.6',
        }}
      />
    );
  }
  
  // Caso contrário, renderiza como texto simples
  return (
    <div className={cn("whitespace-pre-wrap", className)}>
      {content}
    </div>
  );
}