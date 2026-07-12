import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Quote } from "lucide-react";

export function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false, autolink: true })],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[160px] rounded-b border border-t-0 border-input bg-background p-3 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return <div className="h-48 rounded border border-input bg-muted/30" />;

  const btn = "rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground";
  const on = "bg-accent text-foreground";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t border border-input bg-muted/40 p-1">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${btn} ${editor.isActive("bold") ? on : ""}`} aria-label="Bold"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btn} ${editor.isActive("italic") ? on : ""}`} aria-label="Italic"><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${btn} ${editor.isActive("heading", { level: 2 }) ? on : ""}`}><Heading2 className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btn} ${editor.isActive("bulletList") ? on : ""}`}><List className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btn} ${editor.isActive("orderedList") ? on : ""}`}><ListOrdered className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${btn} ${editor.isActive("blockquote") ? on : ""}`}><Quote className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => {
          const url = window.prompt("URL"); if (!url) return;
          editor.chain().focus().setLink({ href: url }).run();
        }} className={`${btn} ${editor.isActive("link") ? on : ""}`}><LinkIcon className="h-3.5 w-3.5" /></button>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}
