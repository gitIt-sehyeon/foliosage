import React from 'react'
import { Layers, ImageIcon, FileText, Archive, Sparkles } from 'lucide-react'
import FileChip from './FileChip'

interface FileItem {
  fileId: string
  name: string
  size: number | null
  confidence: number
  locked: boolean
}

interface Props {
  categoryKey: string
  label: string
  subtitle: string
  files: FileItem[]
}

const CATEGORY_STYLE: Record<string, { icon: React.ReactNode; tone: string; bg: string }> = {
  system:      { icon: <Layers size={18} />,   tone: '#c4b5fd', bg: 'rgba(167,139,250,0.12)' },
  visual:      { icon: <ImageIcon size={18} />, tone: '#cffafe', bg: 'rgba(103,232,249,0.12)' },
  document:    { icon: <FileText size={18} />,  tone: '#fde68a', bg: 'rgba(252,211,77,0.12)'  },
  deliverable: { icon: <Archive size={18} />,   tone: '#a7f3d0', bg: 'rgba(110,231,183,0.12)' },
}

export default function CategoryColumn({ categoryKey, label, subtitle, files }: Props) {
  const style = CATEGORY_STYLE[categoryKey] ?? CATEGORY_STYLE.document

  return (
    <div style={{
      borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
      minHeight: 200,
    }}>
      <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: style.bg, color: style.tone,
          }}>
            {style.icon}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>{label}</p>
              <span style={{ fontSize: 11, color: '#64748b' }}>{files.length}개 파일</span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>{subtitle}</p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 9999, fontSize: 10.5,
            background: 'rgba(167,139,250,0.12)', color: '#c4b5fd',
          }}>
            <Sparkles size={10} />자동
          </span>
        </div>
      </div>
      <div style={{ padding: '10px 12px', display: 'grid', gap: 5 }}>
        {files.map(f => (
          <FileChip key={f.fileId} {...f} />
        ))}
        {files.length === 0 && (
          <p style={{ margin: '12px 0', fontSize: 12, color: '#334155', textAlign: 'center' }}>
            파일 없음
          </p>
        )}
      </div>
    </div>
  )
}
