import { Bot } from 'lucide-react'

interface Props { reasoning: string | null }

export default function OrganizerReasoning({ reasoning }: Props) {
  if (!reasoning) return null
  return (
    <div style={{
      marginTop: 18, padding: '18px 22px', borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(11,16,32,0.7)',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <span style={{ color: '#a5f3fc', flexShrink: 0, marginTop: 1 }}>
        <Bot size={20} />
      </span>
      <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>
        <strong style={{ color: '#fff', fontWeight: 600 }}>왜 이렇게 묶였나요?</strong>
        {' '}
        <span style={{ color: '#94a3b8' }}>{reasoning}</span>
      </p>
    </div>
  )
}
