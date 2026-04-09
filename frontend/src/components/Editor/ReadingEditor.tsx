"use client";
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, Quote, Mic, MicOff, Loader2 } from 'lucide-react';

// Declaration for TypeScript to recognize the Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition && editor) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          // Insert final text at current cursor position
          editor.commands.insertContent(finalTranscript + " ");
        }
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onend = () => setIsListening(false);
      setRecognition(recog);
    }
  }, [editor]);

  const toggleListening = () => {
    if (!recognition) return alert("Speech recognition not supported in this browser.");
    
    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100 items-center">
      <div className="flex gap-1 border-r border-gray-200 pr-2">
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
      </div>

      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-white text-[#14919B] border border-[#14919B]/20 hover:bg-[#14919B]/5'
        }`}
      >
        {isListening ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
        {isListening ? "Listening..." : "Dictate Note"}
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
      if(onChange) onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose focus:outline-none min-h-[300px] p-6 text-gray-700 font-main max-w-none',
      },
    },
  });

  return (
    <div className="w-full transition-all">
      {editable && <MenuBar editor={editor} />}
      <div className="min-h-[300px] cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}