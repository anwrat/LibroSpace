'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-[#14919B] text-white' : 'text-gray-400 hover:bg-gray-200'}`}
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-[#14919B] text-white' : 'text-gray-400 hover:bg-gray-200'}`}
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-[#14919B] text-white' : 'text-gray-400 hover:bg-gray-200'}`}
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-[#14919B] text-white' : 'text-gray-400 hover:bg-gray-200'}`}
      >
        <Quote size={18} />
      </button>
    </div>
  );
};

export default function ReadingEditor({ content, onChange, editable = true }: { content: string, onChange?: (html: string) => void, editable?: boolean }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      if(onChange) onChange(editor.getHTML()); // Send HTML to your backend
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4 text-gray-700 font-main',
      },
    },
  });

  return (
    <div className="w-full border-2 border-gray-100 rounded-3xl p-4 bg-white focus-within:border-[#14919B] transition-all">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}