'use client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import OrganizerBanner from './OrganizerBanner'
import CategoryColumn from './CategoryColumn'
import OrganizerReasoning from './OrganizerReasoning'
import { useOrganizerResult } from './useOrganizerResult'

interface Props { portfolioId: string }

export default function SmartOrganizerView({ portfolioId }: Props) {
  const router = useRouter()
  const { data, error, startOrganize } = useOrganizerResult(portfolioId)

  const isDone = data?.status === 'done'
  const isRunning = data?.status === 'running'
  const isIdle = !data || data.status === 'idle'

  return (
    <div style={{ minHeight: '100vh', background: '#070b15', color: '#fff' }}>
      {/* Top nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(7,11,21,0.85)', backdropFilter: 'blur(12px)',
        padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>AI 파일 정리</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isRunning && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 9999, fontSize: 12,
              background: 'rgba(167,139,250,0.12)', color: '#c4b5fd',
            }}>
              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
              AI 분류 중 · {data?.progressPercent ?? 0}%
            </span>
          )}
          {isDone && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 9999, fontSize: 12,
              background: 'rgba(167,139,250,0.12)', color: '#c4b5fd',
            }}>
              AI 분류 완료 · 100%
            </span>
          )}
          <button
            style={{ fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            onClick={() => router.push(`/portfolios/${portfolioId}`)}
          >
            건너뛰기
          </button>
          <button
            disabled={!isDone}
            onClick={() => router.push(`/portfolios/${portfolioId}`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: isDone ? 'linear-gradient(135deg,#7c3aed,#0e7490)' : 'rgba(255,255,255,0.06)',
              color: isDone ? '#fff' : '#475569', border: 'none',
              cursor: isDone ? 'pointer' : 'not-allowed',
            }}
          >
            분류 결과 확정 <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 40px 40px' }}>
        {error && (
          <div style={{ padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {isIdle && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#64748b', marginBottom: 24 }}>아직 AI 분류가 실행되지 않았습니다.</p>
            <button
              onClick={startOrganize}
              style={{
                padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                background: 'linear-gradient(135deg,#7c3aed,#0e7490)',
                color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              AI 정리 시작
            </button>
          </div>
        )}

        {(isRunning || isDone) && data && (
          <>
            <OrganizerBanner
              totalFiles={data.totalFiles}
              classifiedFiles={data.classifiedFiles}
              progressPercent={data.progressPercent}
              status={data.status}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {data.categories.map(cat => (
                <CategoryColumn
                  key={cat.key}
                  categoryKey={cat.key}
                  label={cat.label}
                  subtitle={cat.subtitle}
                  files={cat.files}
                />
              ))}
            </div>
            <OrganizerReasoning reasoning={data.reasoning} />
          </>
        )}
      </div>
    </div>
  )
}
