import { useRef, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  
  // Mémoriser les modules pour éviter les re-renders inutiles
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  }), []);

  return (
    <div style={{ marginBottom: "1rem" }}>
      {/* Note: react-quill utilise findDOMNode qui est déprécié dans React 18.
          C'est un warning connu de la bibliothèque et n'affecte pas le fonctionnement.
          Le warning disparaîtra quand react-quill sera mis à jour. */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        bounds="self"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
        }}
      />
      <style>{`
        .ql-container {
          background: var(--color-surface);
          color: var(--color-text);
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .ql-toolbar {
          background: var(--color-surface-elevated);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: var(--color-border);
        }
        .ql-editor {
          min-height: 200px;
        }
        .ql-editor.ql-blank::before {
          color: var(--color-muted);
        }
        .ql-stroke {
          stroke: var(--color-text);
        }
        .ql-fill {
          fill: var(--color-text);
        }
        .ql-picker-label {
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

