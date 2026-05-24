'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import OrganizerBanner from './OrganizerBanner'
import CategoryColumn from './CategoryColumn'
import OrganizerReasoning from './OrganizerReasoning'
import { useOrganizerResult } from './useOrganizerResult'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import api from '@/lib/api'

interface Props { portfolioId: string }

export default function SmartOrganizerView({ portfolioId }: Props) {
  const router = useRouter()
  const { data, error, startOrganize, updateLocalCategory } = useOrganizerResult(portfolioId)
  const [isConfirming, setIsConfirming] = useState(false)

  const isDone = data?.status === 'done'
  const isRunning = data?.status === 'running'
  const isIdle = !data || data.status === 'idle'

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const CATEGORY_KEYS = ['system', 'visual', 'document', 'deliverable']

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || !data || data.status !== 'done') return
    const fileId = active.id as string
    const overId = over.id as string
    const newCategoryKey = CATEGORY_KEYS.includes(overId)
      ? overId
      : data.categories.find(c => c.files.some(f => f.fileId === overId))?.key
    if (!newCategoryKey) return
    const oldCategory = data.categories.find(c => c.files.some(f => f.fileId === fileId))
    if (!oldCategory || oldCategory.key === newCategoryKey) return

    const originalFile = data.categories.flatMap(c => c.files).find(f => f.fileId === fileId)
    const originalLocked = originalFile?.locked ?? false

    updateLocalCategory(fileId, newCategoryKey)

    try {
      await api.patch(`/api/portfolios/${portfolioId}/files/${fileId}/category`, {
        category: newCategoryKey,
      })
    } catch {
      updateLocalCategory(fileId, oldCategory.key, originalLocked)
    }
  }

  const handleConfirm = async () => {
    if (isConfirming) return
    setIsConfirming(true)
    try {
      await api.post(`/api/portfolios/${portfolioId}/organize/confirm`)
    } catch {
      // navigate even on failure — data is already persisted
    }
    router.push(`/portfolios/${portfolioId}`)
  }

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
            disabled={!isDone || isConfirming}
            onClick={handleConfirm}
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

        {data === null && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)', minHeight: 200,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 6 }} />
                      <div style={{ height: 10, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }} />
                    </div>
                  </div>
                </div>
                <div style={{ padding: '10px 12px', display: 'grid', gap: 5 }}>
                  {[0,1].map(j => (
                    <div key={j} style={{ height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isIdle && data?.totalFiles === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: '#64748b', fontSize: 15 }}>업로드된 파일이 없습니다.</p>
            <button
              onClick={() => router.push(`/portfolios/${portfolioId}`)}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 8, fontSize: 14,
                background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                border: 'none', cursor: 'pointer',
              }}
            >
              파일 업로드 페이지로
            </button>
          </div>
        )}

        {isIdle && data !== null && (data?.totalFiles ?? 0) > 0 && (
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
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
            </DndContext>
            <OrganizerReasoning reasoning={data.reasoning} />
          </>
        )}

        {(data?.status === 'failed' || data?.status === 'running') && !isDone && (
          <div style={{ textAlign: 'center', padding: data.status === 'failed' ? '60px 0' : '20px 0' }}>
            {data.status === 'failed' && (
              <p style={{ color: '#fca5a5', fontSize: 15, marginBottom: 16 }}>
                AI 분류 중 오류가 발생했습니다.
              </p>
            )}
            <button
              onClick={startOrganize}
              style={{
                padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
