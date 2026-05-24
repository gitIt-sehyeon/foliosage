'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckCircle2, Lock } from 'lucide-react'

interface Props {
  fileId: string
  name: string
  size: number | null
  confidence: number
  locked: boolean
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export default function FileChip({ fileId, name, size, confidence, locked }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fileId })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10,
        background: isDragging ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${locked ? 'rgba(167,139,250,0.30)' : 'rgba(255,255,255,0.04)'}`,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <span style={{ color: locked ? '#a78bfa' : '#6ee7b7', flexShrink: 0 }}>
        {locked ? <Lock size={14} /> : <CheckCircle2 size={14} />}
      </span>
      <p style={{
        margin: 0, flex: 1, fontSize: 12.5, color: '#e2e8f0',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {name}
      </p>
      <p style={{ margin: 0, fontSize: 10.5, color: '#475569', flexShrink: 0 }}>
        {formatSize(size)}
      </p>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '2px 8px', borderRadius: 9999, fontSize: 10.5, fontWeight: 600,
        background: 'rgba(103,232,249,0.12)', color: '#cffafe',
      }}>
        {confidence}%
      </span>
    </div>
  )
}
