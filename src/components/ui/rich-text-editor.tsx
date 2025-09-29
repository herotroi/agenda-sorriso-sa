import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Extension, Node } from '@tiptap/react';
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
  Plus,
  Move,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Custom Resizable Image Extension
const ResizableImage = Node.create({
  name: 'resizableImage',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const container = document.createElement('div')
      container.className = 'resizable-image-container'
      container.style.cssText = `
        position: relative;
        display: inline-block;
        margin: 8px 0;
        border: 2px solid transparent;
        border-radius: 8px;
        max-width: 100%;
      `

      const img = document.createElement('img')
      img.src = node.attrs.src
      img.alt = node.attrs.alt || ''
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
        border-radius: 6px;
        ${node.attrs.width ? `width: ${node.attrs.width}px;` : ''}
        ${node.attrs.height ? `height: ${node.attrs.height}px;` : ''}
      `

      const resizeHandle = document.createElement('div')
      resizeHandle.className = 'resize-handle'
      resizeHandle.style.cssText = `
        position: absolute;
        bottom: -8px;
        right: -8px;
        width: 16px;
        height: 16px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      `
      resizeHandle.innerHTML = '⟲'

      let isResizing = false
      let startX = 0
      let startY = 0
      let startWidth = 0
      let startHeight = 0

      const showControls = () => {
        container.style.borderColor = '#3b82f6'
        resizeHandle.style.opacity = '1'
      }

      const hideControls = () => {
        if (!isResizing) {
          container.style.borderColor = 'transparent'
          resizeHandle.style.opacity = '0'
        }
      }

      container.addEventListener('mouseenter', showControls)
      container.addEventListener('mouseleave', hideControls)

      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault()
        isResizing = true
        startX = e.clientX
        startY = e.clientY
        startWidth = img.offsetWidth
        startHeight = img.offsetHeight
        
        const onMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX
          const deltaY = e.clientY - startY
          
          // Maintain aspect ratio by using diagonal movement
          const delta = Math.max(deltaX, deltaY)
          const aspectRatio = startWidth / startHeight
          
          let newWidth = Math.max(100, startWidth + delta)
          let newHeight = newWidth / aspectRatio
          
          // Limit maximum size
          newWidth = Math.min(newWidth, 800)
          newHeight = Math.min(newHeight, 600)
          
          img.style.width = newWidth + 'px'
          img.style.height = newHeight + 'px'
        }

        const onMouseUp = () => {
          isResizing = false
          hideControls()
          
          // Update the node attributes
          const pos = getPos()
          if (typeof pos === 'number') {
            editor.chain()
              .setNodeSelection(pos)
              .updateAttributes('resizableImage', {
                width: img.offsetWidth,
                height: img.offsetHeight,
              })
              .run()
          }
          
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })

      container.appendChild(img)
      container.appendChild(resizeHandle)

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'resizableImage') return false
          
          img.src = updatedNode.attrs.src
          img.alt = updatedNode.attrs.alt || ''
          
          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width + 'px'
          }
          if (updatedNode.attrs.height) {
            img.style.height = updatedNode.attrs.height + 'px'
          }
          
          return true
        }
      }
    }
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  debounceDelay?: number; // Delay para evitar auto-save
}

export function RichTextEditor({ content, onChange, placeholder, className, debounceDelay = 2000 }: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const editorRef = useRef<any>(null);

  // Improved debounced onChange that prevents autosave for tables
  const debouncedOnChange = useCallback((newContent: string) => {
    // Completely disable autosave when table operations are happening
    if (editorRef.current?.isActive('table') || 
        editorRef.current?.isActive('tableCell') || 
        editorRef.current?.isActive('tableHeader')) {
      console.log('Table element active, skipping autosave');
      setHasUnsavedChanges(true);
      return; // Don't save at all during table operations
    }
    
    setHasUnsavedChanges(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onChange(newContent);
      setHasUnsavedChanges(false);
    }, debounceDelay);
  }, [onChange, debounceDelay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      ResizableImage,
      ResizableTable.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 80,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header-cell',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'table-cell',
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      debouncedOnChange(newContent);
    },
    onCreate: ({ editor }) => {
      console.log('RichTextEditor: Editor created successfully with resizable features');
      editorRef.current = editor;
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none p-4 min-h-[100px] max-w-none rich-text-content',
      },
      handleKeyDown: (view, event) => {
        // Prevent certain shortcuts when table is active to avoid closing
        if (editorRef.current?.isActive('table')) {
          if (event.key === 'Escape') {
            return true; // Prevent default behavior
          }
        }
        return false;
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

      // Use resizable image instead of regular image
      editor?.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: {
          src: publicUrl,
          alt: `Uploaded image ${fileName}`,
        },
      }).run();
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
      // Use resizable image instead of regular image  
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: {
          src: imageUrl,
          alt: 'Image from URL',
        },
      }).run();
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
    <div className={`border border-input rounded-lg bg-background ${className || ''} ${hasUnsavedChanges ? 'border-amber-400' : ''}`}>
      {/* Status indicator */}
      {hasUnsavedChanges && (
        <div className="px-3 py-1 bg-amber-50 border-b border-amber-200 text-xs text-amber-700 flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          Alterações serão salvas automaticamente...
        </div>
      )}
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
            position: relative;
            transition: border-color 0.2s ease;
          }
          
          .rich-text-content table:focus-within,
          .rich-text-content table:hover {
            border-color: #3b82f6;
          }
          
          .rich-text-content table td,
          .rich-text-content table th {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
            min-width: 100px;
            position: relative;
            resize: horizontal;
            overflow: hidden;
          }
          
          .rich-text-content table th {
            background-color: #f9fafb;
            font-weight: 600;
          }
          
          .rich-text-content .selectedCell {
            background: rgba(59, 130, 246, 0.1) !important;
            position: relative;
          }
          
          .rich-text-content .selectedCell:after {
            background: rgba(59, 130, 246, 0.2);
            content: "";
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
          }
          
          /* Resizable image container styles */
          .resizable-image-container {
            position: relative;
            display: inline-block;
            margin: 8px 0;
            border: 2px solid transparent;
            border-radius: 8px;
            max-width: 100%;
            transition: border-color 0.2s ease;
          }
          
          .resizable-image-container:hover {
            border-color: #3b82f6;
          }
          
          .resizable-image-container img {
            border-radius: 6px;
            max-width: 100%;
            height: auto;
            display: block;
          }
          
          .resize-handle {
            position: absolute;
            bottom: -5px;
            right: -5px;
            width: 12px;
            height: 12px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            cursor: se-resize;
            opacity: 0;
            transition: opacity 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .resizable-image-container:hover .resize-handle {
            opacity: 1;
          }
          
          /* Table resize handles - Enhanced visual feedback */
          .table-wrapper-resizable:hover {
            border-color: #3b82f6;
          }
          
          .table-wrapper-resizable .column-resize-handle:hover {
            background: rgba(59, 130, 246, 0.1);
          }
          
          .table-wrapper-resizable .column-resize-handle:hover div {
            opacity: 1 !important;
          }
          
          /* Enhanced table selection feedback */
          .rich-text-content table.ProseMirror-selectednode {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          
          /* Better focus styles for editing */
          .rich-text-content [contenteditable]:focus {
            outline: none;
          }
          
          /* Prevent text selection during resize */
          .resizing {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
        `}</style>
        
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>

      {/* Table controls when table is active */}
      {editor.isActive('table') && (
        <div className="p-3 border-t border-border bg-blue-50/50">
          <div className="flex items-center gap-2 mb-2">
            <TableIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Controles da Tabela</span>
            <div className="text-xs text-blue-600 ml-auto">
              💡 Passe o mouse sobre as bordas das colunas para ver os handles de redimensionamento
            </div>
          </div>
          <div className="flex flex-wrap gap-1 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="hover:bg-blue-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              Col. Antes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="hover:bg-blue-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              Col. Depois
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="hover:bg-blue-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              Linha Antes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="hover:bg-blue-100"
            >
              <Plus className="h-3 w-3 mr-1" />
              Linha Depois
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="hover:bg-red-100 hover:text-red-700"
            >
              <Minus className="h-3 w-3 mr-1" />
              Del. Coluna
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="hover:bg-red-100 hover:text-red-700"
            >
              <Minus className="h-3 w-3 mr-1" />
              Del. Linha
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="ml-auto"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Deletar Tabela
            </Button>
          </div>
        </div>
      )}

      {/* Image resize tip when image is selected */}
      {editor.isActive('resizableImage') && (
        <div className="p-2 border-t border-border bg-green-50/50 text-xs text-green-700 flex items-center gap-2">
          <Move className="h-3 w-3" />
          <span>💡 Use o botão azul no canto da imagem para redimensionar</span>
        </div>
      )}
    </div>
  );
}