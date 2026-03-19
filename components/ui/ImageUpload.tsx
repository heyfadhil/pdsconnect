"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  bucket: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Height of the preview image (Tailwind class, default h-20) */
  previewClass?: string;
}

export default function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Upload Image",
  previewClass = "h-20",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

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

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

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
        <div className="relative group inline-flex w-fit">
          <img
            src={value}
            alt="Preview"
            className={`${previewClass} w-auto max-w-[200px] rounded-xl object-cover border border-[#E5E7EB]`}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-2.5 py-1 bg-white/95 rounded-lg text-[11px] font-semibold text-[#0D0D0D] hover:bg-white transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={11} className="animate-spin" /> : "Change"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 bg-white/95 rounded-lg text-[#0D0D0D] hover:bg-white transition-colors"
            >
              <X size={11} />
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
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}