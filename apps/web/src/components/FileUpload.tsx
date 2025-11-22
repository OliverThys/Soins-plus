import React, { useRef, useState } from "react";
import { api } from "../services/api";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // en MB
  onFileSelect?: (file: File) => void;
  onUploadComplete?: (fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  required?: boolean;
  value?: string;
  name?: string; // Pour l'utilisation dans un formulaire
  autoUpload?: boolean; // Si false, retourne juste le fichier sans upload
}

export function FileUpload({
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxSize = 10,
  onFileSelect,
  onUploadComplete,
  onUploadError,
  required,
  value,
  name,
  autoUpload = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de la taille
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `Fichier trop volumineux. Maximum: ${maxSize}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validation du type
    const validTypes = accept.split(",").map((t) => t.trim().replace(".", ""));
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !validTypes.some((type) => file.name.toLowerCase().endsWith(type))) {
      const errorMsg = `Format non autorisé. Formats acceptés: ${accept}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setError(null);
    setFileName(file.name);

    // Si autoUpload est false, on retourne juste le fichier
    if (!autoUpload) {
      onFileSelect?.(file);
      return;
    }

    // Sinon, on upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload/diploma", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUploadComplete?.(response.data.fileUrl);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'upload";
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="field">
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={uploading}
      />
      <div
        onClick={handleClick}
        className={`input input--floating file-upload ${error ? "input--error" : ""} ${uploading ? "input--disabled" : ""}`}
        style={{ cursor: uploading ? "not-allowed" : "pointer" }}
      >
        {uploading ? (
          <span className="muted">Upload en cours...</span>
        ) : fileName || value ? (
          <span>{fileName || "Fichier sélectionné"}</span>
        ) : (
          <span className="muted">Cliquez pour sélectionner un fichier</span>
        )}
      </div>
      <span className="floating-label">{label} {required && "*"}</span>
      {error && <span className="field-error">{error}</span>}
      {!error && !uploading && (
        <span className="muted" style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Formats acceptés: {accept} (max {maxSize}MB)
        </span>
      )}
    </div>
  );
}

