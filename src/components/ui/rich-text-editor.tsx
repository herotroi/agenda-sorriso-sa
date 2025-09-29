import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Upload,
  Palette,
  Minus,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      onChange(newContent);
    },
    onCreate: () => {
      console.log('RichTextEditor: Editor created successfully');
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none p-4 min-h-[100px] max-w-none rich-text-content',
      },
    },
  });

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      editor?.chain().focus().setImage({ src: publicUrl }).run();
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      toast.error('Erro ao carregar a imagem');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const addImageFromUrl = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const addTable = () => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const setTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };

  if (!editor) {
    return (
      <div className="border border-input rounded-lg bg-background p-4 min-h-[100px] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className={`border border-input rounded-lg bg-background ${className || ''}`}>
      {/* Toolbar */}
      <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/50">
        {/* Text formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#dc2626')}
            title="Vermelho"
          >
            <Palette className="h-4 w-4" style={{ color: '#dc2626' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#059669')}
            title="Verde"
          >
            <Palette className="h-4 w-4" style={{ color: '#059669' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#2563eb')}
            title="Azul"
          >
            <Palette className="h-4 w-4" style={{ color: '#2563eb' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#000000')}
            title="Preto"
          >
            <Palette className="h-4 w-4" style={{ color: '#000000' }} />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImageInput(!showImageInput)}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* File upload */}
        <label className="cursor-pointer">
          <Button variant="ghost" size="sm" asChild disabled={uploading}>
            <div>
              <Upload className="h-4 w-4" />
            </div>
          </Button>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
          />
        </label>

        {/* Table */}
        <Button
          variant="ghost"
          size="sm"
          onClick={addTable}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Image URL Input */}
      {showImageInput && (
        <div className="p-3 border-b border-border flex gap-2 bg-muted/30">
          <Input
            placeholder="Cole a URL da imagem..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addImageFromUrl()}
          />
          <Button size="sm" onClick={addImageFromUrl}>
            Adicionar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowImageInput(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {/* Editor with custom styles */}
      <div className="min-h-[150px]">
        <style>{`
          .rich-text-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            border: 2px solid #e5e7eb;
          }
          
          .rich-text-content table td,
          .rich-text-content table th {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
            min-width: 100px;
          }
          
          .rich-text-content table th {
            background-color: #f9fafb;
            font-weight: 600;
          }
          
          .rich-text-content table:hover {
            border-color: #3b82f6;
          }
          
          .rich-text-content .selectedCell:after {
            background: rgba(59, 130, 246, 0.1);
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
          }
          
          .rich-text-content img {
            border-radius: 8px;
            margin: 8px 0;
            max-width: 100%;
            height: auto;
          }
          
          .rich-text-content p {
            margin: 8px 0;
          }
          
          .rich-text-content ul,
          .rich-text-content ol {
            padding-left: 24px;
            margin: 8px 0;
          }
          
          .rich-text-content h1,
          .rich-text-content h2,
          .rich-text-content h3 {
            margin: 16px 0 8px 0;
            line-height: 1.4;
          }
        `}</style>
        
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>

      {/* Table controls when table is active */}
      {editor.isActive('table') && (
        <div className="p-2 border-t border-border flex flex-wrap gap-1 text-sm bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            <Plus className="h-3 w-3 mr-1" />
            Col. Antes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Plus className="h-3 w-3 mr-1" />
            Col. Depois
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            <Plus className="h-3 w-3 mr-1" />
            Linha Antes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Plus className="h-3 w-3 mr-1" />
            Linha Depois
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Minus className="h-3 w-3 mr-1" />
            Del. Coluna
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Minus className="h-3 w-3 mr-1" />
            Del. Linha
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Deletar Tabela
          </Button>
        </div>
      )}
    </div>
  );
}