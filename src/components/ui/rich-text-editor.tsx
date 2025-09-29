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
  Underline, 
  List, 
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Upload,
  Type,
  Palette,
  Minus,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Custom Image extension with resize handles
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div');
      container.className = 'image-container relative inline-block group cursor-pointer';
      
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.className = 'max-w-full h-auto rounded-lg';
      
      if (node.attrs.width) img.width = node.attrs.width;
      if (node.attrs.height) img.height = node.attrs.height;
      
      // Resize controls
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'absolute bottom-0 right-0 w-3 h-3 bg-blue-600 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity';
      
      let isResizing = false;
      let startWidth = img.width || img.naturalWidth;
      let startHeight = img.height || img.naturalHeight;
      let startX = 0;
      let startY = 0;
      
      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.width || img.naturalWidth;
        startHeight = img.height || img.naturalHeight;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const aspectRatio = startHeight / startWidth;
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = newWidth * aspectRatio;
        
        img.width = newWidth;
        img.height = newHeight;
      };
      
      const handleMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Update the node attributes
        if (typeof getPos === 'function') {
          const pos = getPos();
          editor.commands.updateAttributes('image', {
            width: img.width,
            height: img.height,
          });
        }
      };
      
      resizeHandle.addEventListener('mousedown', handleMouseDown);
      
      container.appendChild(img);
      container.appendChild(resizeHandle);
      
      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width) img.width = updatedNode.attrs.width;
          if (updatedNode.attrs.height) img.height = updatedNode.attrs.height;
          return true;
        }
      };
    };
  }
});

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
  const [currentColor, setCurrentColor] = useState('#000000');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
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
      onChange(editor.getHTML());
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
    setCurrentColor(color);
  };

  if (!editor) {
    return null;
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
            onClick={() => setTextColor('#ff0000')}
          >
            <Palette className="h-4 w-4" style={{ color: '#ff0000' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#00ff00')}
          >
            <Palette className="h-4 w-4" style={{ color: '#00ff00' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#0000ff')}
          >
            <Palette className="h-4 w-4" style={{ color: '#0000ff' }} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTextColor('#000000')}
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
          .image-container .resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 12px;
            height: 12px;
            background: #3b82f6;
            cursor: se-resize;
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .image-container:hover .resize-handle {
            opacity: 1;
          }
          
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