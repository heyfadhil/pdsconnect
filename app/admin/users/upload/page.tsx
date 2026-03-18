"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";

type UploadResult = {
  created: number;
  updated: number;
  errors: { row: number; email: string; error: string }[];
};

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/users/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setFile(null);
    } else {
      setError(data.error ?? "Upload failed. Please check your file.");
    }
    setUploading(false);
  };

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Excel Upload"
        description="Bulk-import users from a spreadsheet. New emails create accounts; existing emails update the record."
        action={<Link href="/admin/users" className="text-sm text-mid-gray hover:text-ink-gray transition-colors">← Back to Users</Link>}
      />

      {/* Column spec */}
      <div className="bg-pale-blue-tint border border-light-border rounded-2xl p-5 mb-8">
        <p className="text-sm font-semibold text-calm-blue mb-3">Required Spreadsheet Columns</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { col: "name", req: true },
            { col: "email", req: true },
            { col: "company_name", req: true },
            { col: "role", req: true },
            { col: "website_url", req: false },
            { col: "industry", req: false },
            { col: "bio", req: false },
            { col: "logo_url", req: false },
          ].map(({ col, req }) => (
            <div key={col} className="flex items-center gap-1.5">
              <code className="text-[11px] bg-white border border-light-border px-2 py-0.5 rounded font-mono text-ink-gray">{col}</code>
              {req && <span className="text-[10px] text-calm-blue font-semibold">*</span>}
            </div>
          ))}
        </div>
        <p className="text-[12px] text-mid-gray mt-3">
          <strong>role</strong> must be <code className="font-mono">buyer</code> or <code className="font-mono">procurer</code>.
          Download <a href="/templates/user_upload_template.xlsx" className="text-calm-blue underline">template file →</a>
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all mb-6 ${dragging ? "border-calm-blue bg-pale-blue-tint" : file ? "border-calm-blue bg-pale-blue-tint" : "border-light-border hover:border-calm-blue hover:bg-pale-blue-tint"}`}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-calm-blue/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7FD9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <p className="font-semibold text-carbon-black text-sm">{file.name}</p>
            <p className="text-[12px] text-mid-gray">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-mid-gray">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
            <p className="text-sm font-medium">Drop your Excel or CSV file here</p>
            <p className="text-[12px]">or click to browse</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">{error}</p>}

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-calm-blue text-white text-sm font-semibold hover:bg-deep-blue transition-colors disabled:opacity-50 mb-8"
        >
          {uploading ? (
            <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Processing...</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Upload & Process</>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-light-border shadow-sm p-6">
          <h3 className="font-display text-heading-4 font-semibold text-carbon-black mb-5">Upload Complete</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-3xl font-bold text-green-700">{result.created}</p>
              <p className="text-sm font-medium text-green-600 mt-1">New accounts created</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-pale-blue-tint border border-light-border">
              <p className="text-3xl font-bold text-calm-blue">{result.updated}</p>
              <p className="text-sm font-medium text-calm-blue mt-1">Existing records updated</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-600 mb-3">{result.errors.length} row(s) had errors:</p>
              <div className="space-y-2">
                {result.errors.map((e) => (
                  <div key={e.row} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-[11px] font-bold text-red-500 mt-0.5">Row {e.row}</span>
                    <span className="text-sm text-red-700">{e.email} — {e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-light-border">
            <Link href="/admin/users" className="text-sm font-semibold text-calm-blue hover:text-deep-blue transition-colors">View all users →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
