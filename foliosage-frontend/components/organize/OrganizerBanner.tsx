import { Wand2 } from 'lucide-react'

interface Props {
  totalFiles: number
  classifiedFiles: number
  progressPercent: number
  status: string
}

export default function OrganizerBanner({ totalFiles, classifiedFiles, progressPercent, status }: Props) {
  const isRunning = status === 'running'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '22px 26px', borderRadius: 18,
      border: '1px solid rgba(167,139,250,0.25)',
      background: 'linear-gradient(120deg, rgba(124,58,237,0.20), rgba(34,211,238,0.10) 65%)',
      marginBottom: 20,
    }}>
      <span style={{
        width: 56, height: 56, borderRadius: 16,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(167,139,250,0.20)', color: '#fff',
        boxShadow: '0 0 40px rgba(124,58,237,0.50)',
      }}>
        <Wand2 size={26} />
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 11, color: '#c4b5fd', letterSpacing: '0.24em', textTransform: 'uppercase' }}>
          VaultSage Smart Organizer
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600, color: '#fff' }}>
          Classifying {totalFiles} files into four evidence categories
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
          {isRunning
            ? 'Analyzing file context. Please wait...'
            : 'Drag files to correct any category.'}
        </p>
      </div>
      <div style={{ width: 160 }}>
        <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`, height: '100%',
            background: 'linear-gradient(90deg,#a78bfa,#22d3ee,#6ee7b7)',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'right' }}>
          {classifiedFiles} / {totalFiles} classified
        </p>
      </div>
    </div>
  )
}
