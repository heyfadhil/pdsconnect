"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, FileText, ExternalLink } from "lucide-react";

interface Props {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({
  bucket,
  value,
  onChange,
  accept = "application/pdf",
  label = "Upload PDF",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  function displayName(url: string) {
    try {
      const raw = decodeURIComponent(url.split("/").pop() ?? url).split("?")[0];
      return raw.length > 50 ? raw.substring(0, 47) + "…" : raw;
    } catch {
      return url.substring(0, 50);
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated.");
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);

    onChange(publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      {value ? (
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] w-fit max-w-xs"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2E7FD9 0%, #06B6D4 100%)" }}
          >
            <FileText size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#0D0D0D] truncate">{displayName(value)}</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#06B6D4] hover:text-[#0D9488] flex items-center gap-1 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={9} />
              View file
            </a>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-[11px] px-2 py-1 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#06B6D4] hover:border-[#06B6D4] transition-colors font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 size={11} className="animate-spin" /> : "Change"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 text-[#9CA3AF] hover:text-red-600 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed text-[13px] font-medium transition-all w-fit disabled:opacity-60 hover:-translate-y-px"
          style={{
            borderColor: "rgba(6,182,212,0.40)",
            color: uploading ? "#06B6D4" : "#8A8A8A",
            background: uploading ? "rgba(236,254,255,0.5)" : "transparent",
          }}
        >
          {uploading ? (
            <Loader2 size={14} className="animate-spin text-[#06B6D4]" />
          ) : (
            <Upload size={14} />
          )}
          {uploading ? "Uploading…" : label}
        </button>
      )}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
