"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  List,
  Mic,
  Loader2,
  Heading1,
  Heading2,
  Type,
  Highlighter,
} from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [isListening, setIsListening] = useState(false);
  // Use a stable mutable reference instead of state to track the hardware stream loop safely
  const recognitionRef = useRef<any>(null);

  // Dummy state to force menu re-renders when the editor selection changes
  const [, setSelectionUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;

    // Listen to selection or updates to force update button highlighted active states
    const handleUpdate = () => {
      setSelectionUpdate((prev) => prev + 1);
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  // Handle Speech Recognition Instance Lifecycle Configuration cleanly
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition && editor && !recognitionRef.current) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          editor.commands.insertContent(finalTranscript + " ");
        }
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onstart = () => setIsListening(true);
      recog.onend = () => setIsListening(false);

      recognitionRef.current = recog;
    }
  }, [editor]);

  // Clean closure toggling layout rule execution framework
  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return alert("Speech recognition not supported or not initialized yet.");
    }

    if (isListening) {
      // Hardware instructions command to actively terminate current voice processing stream
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.warn(
          "Recognition already running or restarting active session loops:",
          err,
        );
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-50 rounded-xl border border-gray-100 items-center justify-between">
      <div className="flex flex-wrap gap-1 items-center">
        {/* Inline Formatting Group */}
        <div className="flex gap-1 border-r border-gray-200 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("bold")
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("italic")
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("highlight")
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Highlight Text"
          >
            <Highlighter size={18} />
          </button>
        </div>

        {/* Text Sizing / Headings Group */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 pl-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Regular Text Size"
          >
            <Type size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("heading", { level: 2 })
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Medium Heading (H2)"
          >
            <Heading2 size={18} />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("heading", { level: 1 })
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Large Heading (H1)"
          >
            <Heading1 size={18} />
          </button>
        </div>

        {/* Structure Group */}
        <div className="flex gap-1 pl-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all ${
              editor.isActive("bulletList")
                ? "bg-[#14919B] text-white shadow-xs"
                : "text-gray-400 hover:bg-gray-200"
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Dictation Action */}
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
          isListening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-white text-[#14919B] border border-[#14919B]/20 hover:bg-[#14919B]/5"
        }`}
      >
        {isListening ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Mic size={16} />
        )}
        {isListening ? "Stop Dictation" : "Dictate Note"}
      </button>
    </div>
  );
};

export default function ReadingEditor({
  content,
  onChange,
  editable = true,
}: {
  content: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Highlight.configure({ multicolor: false }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "focus:outline-hidden min-h-[300px] p-6 text-gray-700 font-main max-w-none " +
          "[&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2 " +
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-3 [&_h2]:mb-1 " +
          "[&_strong]:font-bold [&_strong]:text-gray-900 " +
          "[&_em]:italic " +
          "[&_mark]:bg-yellow-200 [&_mark]:px-0.5 [&_mark]:rounded-sm " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_li]:my-0.5",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className="w-full transition-all">
      {editable && <MenuBar editor={editor} />}
      <div
        className={`min-h-[300px] ${editable ? "cursor-text border border-gray-200 rounded-xl bg-white shadow-xs" : ""}`}
        onClick={() => editable && editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
