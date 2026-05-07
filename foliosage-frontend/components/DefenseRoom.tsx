'use client'

import { useEffect, useMemo, useState } from 'react'
import { Award, Bot, FileCheck2, Gavel, Loader2, Play, Send, ShieldAlert } from 'lucide-react'
import api from '@/lib/api'

type EvidenceChip = {
  fileId: string
  vaultsageFileId: string
  name: string
  fileHash: string
  certifiedAt: string | null
  reason: string
}

type DefenseTurn = {
  id: string
  questionIndex: number
  question: string
  answer: string | null
  feedback: string | null
  evidence: EvidenceChip[]
  answered: boolean
}

type ScoreCategory = { name: string; score: number; rationale: string }
type Scorecard = {
  overallScore: number
  categories: ScoreCategory[]
  missingProof: string[]
  summary: string
}

type DefenseSession = {
  id: string
  status: 'active' | 'completed' | string
  currentQuestionIndex: number
  totalQuestions: number
  turns: DefenseTurn[]
  scorecard: Scorecard | null
}

export default function DefenseRoom({
  portfolioId,
  published,
  fileCount,
}: {
  portfolioId: string
  published: boolean
  fileCount: number
}) {
  const [session, setSession] = useState<DefenseSession | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentTurn = useMemo(() => {
    if (!session || session.status === 'completed') return null
    return session.turns.find(t => !t.answered) ?? session.turns[session.turns.length - 1] ?? null
  }, [session])

  useEffect(() => {
    api.get(`/api/portfolios/${portfolioId}/defense/sessions/latest`)
      .then(r => setSession(r.data || null))
      .catch(() => {})
  }, [portfolioId])

  const start = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post(`/api/portfolios/${portfolioId}/defense/sessions`)
      setSession(data)
      setAnswer('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Defense 세션을 시작할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    if (!session || !answer.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post(`/api/portfolios/${portfolioId}/defense/sessions/${session.id}/answers`, {
        answer: answer.trim(),
      })
      setSession(data)
      setAnswer('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? '답변 평가에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#111827]/90 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a78bfa]">
            <Gavel className="size-3.5" />
            Defense Room
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">AI 심사위원 앞에서 포트폴리오 방어</h3>
        </div>
        {session && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-[#94a3b8]">
            {session.status === 'completed' ? '완료' : `${Math.min(session.currentQuestionIndex + 1, session.totalQuestions)}/${session.totalQuestions}`}
          </span>
        )}
      </div>

      {!published ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100">
          <ShieldAlert className="mt-0.5 size-4 flex-shrink-0" />
          <p>Defense는 VaultSage 공유 채팅을 사용하므로 포트폴리오 공개 후 시작할 수 있습니다.</p>
        </div>
      ) : fileCount === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0b1020] p-3 text-sm text-[#94a3b8]">파일을 먼저 업로드하세요.</div>
      ) : !session ? (
        <button
          onClick={start}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-45"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          Start Defense
        </button>
      ) : session.status === 'completed' && session.scorecard ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Award className="size-4" />
              Defense Score {session.scorecard.overallScore}
            </p>
            <p className="mt-2 text-sm text-[#cbd5e1]">{session.scorecard.summary}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {session.scorecard.categories.map(category => (
              <div key={category.name} className="rounded-lg border border-white/10 bg-[#0b1020] p-3">
                <p className="text-xs text-[#94a3b8]">{category.name}</p>
                <p className="mt-1 text-xl font-semibold text-white">{category.score}</p>
                <p className="mt-1 line-clamp-3 text-[11px] text-[#64748b]">{category.rationale}</p>
              </div>
            ))}
          </div>
          <button
            onClick={start}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#94a3b8] hover:text-white disabled:opacity-45"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            새 Defense 시작
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTurn && (
            <div className="rounded-xl border border-violet-300/20 bg-[#1e0a3c]/55 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#c4b5fd]">
                <Bot className="size-4" />
                Judge Question {currentTurn.questionIndex + 1}
              </p>
              <p className="text-sm leading-6 text-white">{currentTurn.question}</p>
            </div>
          )}

          <div className="space-y-3">
            {session.turns.filter(t => t.answered).map(turn => (
              <div key={turn.id} className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
                <p className="text-xs font-medium text-[#c4b5fd]">Q{turn.questionIndex + 1}. {turn.question}</p>
                <p className="mt-2 text-sm text-[#cbd5e1]">{turn.feedback}</p>
                {turn.evidence.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {turn.evidence.map(item => (
                      <span key={`${turn.id}-${item.fileId}`} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 text-[11px] text-emerald-200">
                        <FileCheck2 className="size-3" />
                        <span className="truncate">{item.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentTurn && (
            <div className="flex gap-2">
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="답변을 입력하세요..."
                rows={3}
                className="min-h-[92px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#475569] focus:border-[#6d28d9]"
                disabled={loading}
              />
              <button
                onClick={submit}
                disabled={loading || !answer.trim()}
                className="self-stretch rounded-xl bg-[#6d28d9] px-4 text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-45"
                aria-label="답변 제출"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-[#f87171]">{error}</p>}
    </section>
  )
}
