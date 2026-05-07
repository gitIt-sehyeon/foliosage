'use client'

import { useEffect, useState } from 'react'
import { Award, FileCheck2, Loader2, ShieldCheck, X } from 'lucide-react'
import publicApi from '@/lib/publicApi'

type EvidenceChip = {
  fileId: string
  vaultsageFileId: string
  name: string
  fileHash: string
  certifiedAt: string | null
  reason: string
}
type ScoreCategory = { name: string; score: number; rationale: string }
type DefenseTurn = { id: string; questionIndex: number; question: string; feedback: string | null; evidence: EvidenceChip[] }
type DefenseSession = {
  status: string
  turns: DefenseTurn[]
  scorecard: { overallScore: number; categories: ScoreCategory[]; missingProof: string[]; summary: string } | null
}
type PublicDefense = { available: boolean; session: DefenseSession | null; citedFileCount: number; totalEvidenceCount: number }

export default function PublicDefensePanel({
  shareCode,
  open,
  onClose,
  onSelectEvidence,
}: {
  shareCode: string
  open: boolean
  onClose: () => void
  onSelectEvidence: (vaultsageFileId: string) => void
}) {
  const [data, setData] = useState<PublicDefense | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || data || loading) return
    setLoading(true)
    publicApi.get(`/api/public/${shareCode}/defense`)
      .then(r => setData(r.data))
      .catch(() => setData({ available: false, session: null, citedFileCount: 0, totalEvidenceCount: 0 }))
      .finally(() => setLoading(false))
  }, [open, data, loading, shareCode])

  return (
    <div
      className="absolute bottom-4 right-4 top-4 z-30 w-[min(460px,calc(100%-32px))] overflow-hidden rounded-2xl border border-white/10 bg-[#070b15]/96 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all"
      style={{
        transform: open ? 'translateX(0)' : 'translateX(110%)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <ShieldCheck className="size-4" />
              Defense Scorecard
            </p>
            <p className="text-xs text-[#64748b]">AI-reviewed proof from this portfolio</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#64748b] hover:bg-white/[0.06] hover:text-white" aria-label="닫기">
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
              <Loader2 className="size-4 animate-spin" />
              Defense 결과를 불러오는 중...
            </div>
          ) : !data?.available || !data.session?.scorecard ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-[#94a3b8]">
              아직 공개된 Defense Scorecard가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <Award className="size-4" />
                  Overall {data.session.scorecard.overallScore}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">{data.session.scorecard.summary}</p>
                <p className="mt-2 text-xs text-[#64748b]">
                  {data.citedFileCount} cited files · {data.totalEvidenceCount} evidence matches
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {data.session.scorecard.categories.map(category => (
                  <div key={category.name} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-xs text-[#94a3b8]">{category.name}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{category.score}</p>
                    <p className="mt-1 line-clamp-3 text-[11px] text-[#64748b]">{category.rationale}</p>
                  </div>
                ))}
              </div>

              {data.session.turns.map(turn => (
                <div key={turn.id} className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                  <p className="text-xs font-medium text-[#c4b5fd]">Q{turn.questionIndex + 1}. {turn.question}</p>
                  {turn.feedback && <p className="mt-2 text-sm leading-6 text-[#cbd5e1]">{turn.feedback}</p>}
                  {turn.evidence.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {turn.evidence.map(item => (
                        <button
                          key={`${turn.id}-${item.fileId}`}
                          onClick={() => onSelectEvidence(item.vaultsageFileId)}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[11px] text-emerald-200 hover:border-emerald-200/50"
                        >
                          <FileCheck2 className="size-3" />
                          <span className="truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
