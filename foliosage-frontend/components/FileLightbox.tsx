'use client'
import { XCircle, ShieldCheck } from 'lucide-react'

interface Props {
  name: string
  fileHash: string
  pdfUrl: string | null   // non-null → show iframe
  imageUrl: string | null // non-null → show img
  onClose: () => void
}

export default function FileLightbox({ name, fileHash, pdfUrl, imageUrl, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070b15] shadow-2xl shadow-black/60"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <button onClick={onClose} className="ml-4 shrink-0 text-slate-400 transition-colors hover:text-white">
            <XCircle className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {pdfUrl ? (
            <iframe src={pdfUrl} className="h-full w-full border-0" title={name} />
          ) : imageUrl ? (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(124,58,237,0.12),transparent_40%)] p-6">
              <img src={imageUrl} alt={name} className="max-h-full max-w-full rounded-xl object-contain" />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              <p className="text-sm">미리보기를 지원하지 않는 파일 형식입니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/10 px-5 py-3">
          <span className="inline-flex items-center gap-2 text-xs text-emerald-200">
            <ShieldCheck className="size-4" />
            Certified source
          </span>
          <span className="font-mono text-[11px] text-slate-500">{fileHash.slice(0, 24)}…</span>
        </div>
      </div>
    </div>
  )
}
