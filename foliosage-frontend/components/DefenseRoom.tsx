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

function parseJsonLike(value: string | null | undefined): any | null {
  if (!value) return null
  let text = value.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  }
  const objectStart = text.indexOf('{')
  const arrayStart = text.indexOf('[')
  const starts = [objectStart, arrayStart].filter(i => i >= 0)
  if (starts.length > 0) text = text.slice(Math.min(...starts))
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'string') return parseJsonLike(parsed) ?? parsed
    return parsed
  } catch {
    return null
  }
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map(item => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const record = item as Record<string, unknown>
        return String(record.name ?? record.file ?? record.filename ?? record.reason ?? '').trim()
      }
      return ''
    })
    .filter(Boolean)
}

function cleanDisplayText(value: string | null | undefined, preferredFields = ['summary', 'feedback', 'rationale', 'assessment']) {
  const parsed = parseJsonLike(value)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    for (const field of preferredFields) {
      const fieldValue = parsed[field]
      if (typeof fieldValue === 'string' && fieldValue.trim()) return fieldValue.trim()
    }
  }
  return value?.trim() || ''
}

function FeedbackText({ value }: { value: string | null }) {
  const parsed = parseJsonLike(value)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">{value}</p>
  }

  const main = cleanDisplayText(value, ['feedback', 'rationale', 'summary', 'assessment', 'comment'])
  const missingProof = typeof parsed.missingProof === 'string'
    ? [parsed.missingProof]
    : stringList(parsed.missingProof ?? parsed.missing_proof)
  const evidenceFiles = stringList(parsed.evidenceFiles ?? parsed.evidence_files)

  return (
    <div className="mt-2 space-y-2">
      {main && <p className="whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">{main}</p>}
      {evidenceFiles.length > 0 && (
        <div className="rounded-lg border border-emerald-300/15 bg-emerald-300/[0.045] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-200">Evidence files</p>
          <p className="mt-1 text-xs leading-5 text-emerald-100">{evidenceFiles.join(', ')}</p>
        </div>
      )}
      {missingProof.length > 0 && (
        <div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.045] px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-200">Missing proof</p>
          <p className="mt-1 text-xs leading-5 text-amber-100">{missingProof.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

function ReviewTurnHistory({ turns }: { turns: DefenseTurn[] }) {
  const answeredTurns = turns.filter(t => t.answered)
  if (answeredTurns.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#94a3b8]">Review conversation</p>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-[#64748b]">
          {answeredTurns.length} answers
        </span>
      </div>
      {answeredTurns.map(turn => (
        <div key={turn.id} className="rounded-xl border border-white/10 bg-[#0b1020] p-3">
          <p className="text-xs font-medium text-[#c4b5fd]">Q{turn.questionIndex + 1}. {turn.question}</p>
          {turn.answer && (
            <div className="mt-3 rounded-lg border border-violet-300/15 bg-violet-300/[0.045] px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-200">My answer</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#e2e8f0]">{turn.answer}</p>
            </div>
          )}
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#94a3b8]">AI feedback</p>
          <FeedbackText value={turn.feedback} />
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
  )
}

type WorkingStage = 'thinking' | 'reading' | 'scoring'

function AIWorkingMascot({ stage }: { stage: WorkingStage }) {
  const copy = {
    thinking: 'Reading files and creating questions...',
    reading: 'Finding evidence files in your answer...',
    scoring: 'Preparing the AI review results...',
  }[stage]

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-cyan-300/20 bg-cyan-300/[0.055] p-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-24 flex-shrink-0">
          <div className="ai-mascot-body absolute bottom-2 left-5 h-14 w-14 rounded-2xl border border-cyan-200/30 bg-[#11243a] shadow-[0_0_24px_rgba(34,211,238,0.20)]">
            <div className="absolute left-3 top-5 h-2 w-2 rounded-full bg-cyan-200" />
            <div className="absolute right-3 top-5 h-2 w-2 rounded-full bg-cyan-200" />
            <div className="absolute bottom-4 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-violet-200/80" />
            <div className="absolute -top-3 left-1/2 h-4 w-px -translate-x-1/2 bg-cyan-200/50" />
            <div className="absolute -top-5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-cyan-200" />
          </div>
          <div className="ai-mascot-page absolute bottom-3 right-2 h-11 w-8 rounded-md border border-white/20 bg-white/10" />
          <div className="ai-mascot-spark absolute left-2 top-2 size-2 rounded-full bg-violet-200" />
          <div className="ai-mascot-spark absolute right-5 top-1 size-1.5 rounded-full bg-emerald-200 [animation-delay:0.35s]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-cyan-100">{copy}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">VaultSage is checking file evidence and answer context together.</p>
        </div>
      </div>
      <style jsx>{`
        .ai-mascot-body { animation: mascot-bob 1.45s ease-in-out infinite; }
        .ai-mascot-page { animation: mascot-read 1.1s ease-in-out infinite; transform-origin: bottom left; }
        .ai-mascot-spark { animation: mascot-spark 1.25s ease-in-out infinite; }
        @keyframes mascot-bob {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes mascot-read {
          0%, 100% { transform: rotate(-7deg) translateY(0); opacity: 0.72; }
          50% { transform: rotate(7deg) translateY(-4px); opacity: 1; }
        }
        @keyframes mascot-spark {
          0%, 100% { transform: scale(0.7); opacity: 0.45; }
          50% { transform: scale(1.25); opacity: 1; }
        }
      `}</style>
    </div>
  )
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
  const [workingStage, setWorkingStage] = useState<WorkingStage | null>(null)
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
    setWorkingStage('thinking')
    setError('')
    try {
      const { data } = await api.post(`/api/portfolios/${portfolioId}/defense/sessions`)
      setSession(data)
      setAnswer('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Could not start AI review.')
    } finally {
      setLoading(false)
      setWorkingStage(null)
    }
  }

  const submit = async () => {
    if (!session || !answer.trim() || loading) return
    const isFinalAnswer = (currentTurn?.questionIndex ?? -1) >= session.totalQuestions - 1
    setLoading(true)
    setWorkingStage(isFinalAnswer ? 'scoring' : 'reading')
    setError('')
    try {
      const { data } = await api.post(`/api/portfolios/${portfolioId}/defense/sessions/${session.id}/answers`, {
        answer: answer.trim(),
      })
      setSession(data)
      setAnswer('')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.error ?? 'Could not evaluate the answer.')
    } finally {
      setLoading(false)
      setWorkingStage(null)
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-[#111827]/90 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a78bfa]">
            <Gavel className="size-3.5" />
            AI Portfolio Review
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">AI creates review questions and evidence-based feedback</h3>
        </div>
        {session && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-[#94a3b8]">
            {session.status === 'completed' ? 'Complete' : `${Math.min(session.currentQuestionIndex + 1, session.totalQuestions)}/${session.totalQuestions}`}
          </span>
        )}
      </div>

      {!published ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-sm text-amber-100">
          <ShieldAlert className="mt-0.5 size-4 flex-shrink-0" />
          <p>AI review reads evidence through the public portfolio link. Publish the portfolio first.</p>
        </div>
      ) : fileCount === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#0b1020] p-3 text-sm text-[#94a3b8]">Upload files first.</div>
      ) : !session ? (
        <>
          {workingStage && <AIWorkingMascot stage={workingStage} />}
          <button
            onClick={start}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6d28d9] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-45"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            Start AI review
          </button>
        </>
      ) : session.status === 'completed' && session.scorecard ? (
        <div className="space-y-4">
          {workingStage && <AIWorkingMascot stage={workingStage} />}
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <Award className="size-4" />
              Evidence score {session.scorecard.overallScore}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#cbd5e1]">
              {cleanDisplayText(session.scorecard.summary)}
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            {session.scorecard.categories.map(category => (
              <div key={category.name} className="rounded-lg border border-white/10 bg-[#0b1020] p-3">
                <p className="text-xs text-[#94a3b8]">{category.name}</p>
                <p className="mt-1 text-xl font-semibold text-white">{category.score}</p>
                <p className="mt-1 line-clamp-3 text-[11px] text-[#64748b]">{cleanDisplayText(category.rationale)}</p>
              </div>
            ))}
          </div>
          {session.scorecard.missingProof.length > 0 && (
            <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.045] p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-200">Missing proof</p>
              <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100">
                {session.scorecard.missingProof.map(item => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          )}
          <ReviewTurnHistory turns={session.turns} />
          <button
            onClick={start}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#94a3b8] hover:text-white disabled:opacity-45"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            {loading ? 'Preparing new review...' : 'Start new AI review'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workingStage && <AIWorkingMascot stage={workingStage} />}
          {currentTurn && (
            <div className="rounded-xl border border-violet-300/20 bg-[#1e0a3c]/55 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#c4b5fd]">
                <Bot className="size-4" />
                Interview question {currentTurn.questionIndex + 1}
              </p>
              <p className="text-sm leading-6 text-white">{currentTurn.question}</p>
              <div className="mt-4 flex gap-2">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  rows={3}
                  className="min-h-[92px] flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#64748b] focus:border-[#6d28d9]"
                  disabled={loading}
                />
                <button
                  onClick={submit}
                  disabled={loading || !answer.trim()}
                  className="self-stretch rounded-xl bg-[#6d28d9] px-4 text-white transition-colors hover:bg-[#7c3aed] disabled:opacity-45"
                  aria-label="Submit answer"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
            </div>
          )}

          <ReviewTurnHistory turns={session.turns} />
        </div>
      )}

      {error && <p className="mt-3 text-xs text-[#f87171]">{error}</p>}
    </section>
  )
}
