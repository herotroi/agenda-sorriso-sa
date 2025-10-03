import React from 'react';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export function HtmlContent({ content, className }: HtmlContentProps) {
  // Se o conteúdo contém tags HTML, renderiza como HTML sanitizado
  if (content && content.includes('<')) {
    // Sanitiza o HTML para prevenir XSS
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'a', 'span', 'div'],
      ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
    
    return (
      <div 
        className={cn("prose prose-sm max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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