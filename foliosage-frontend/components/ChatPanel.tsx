'use client'
import { useState, useRef, useEffect } from 'react'
import { FileCheck2, MessageSquareText, Send } from 'lucide-react'
import publicApi from '@/lib/publicApi'

interface EvidenceChip { fileId: string; vaultsageFileId: string; name: string }
interface Message { id: number; role: 'user' | 'assistant'; content: string; evidence?: EvidenceChip[] }
interface Props { shareCode: string; dark?: boolean; suggestedQuestions?: string[] }

export default function ChatPanel({ shareCode, dark = false, suggestedQuestions = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: '안녕하세요. 이 포트폴리오에 대해 무엇이든 물어보세요.' }
  ])
  const nextId = useRef(1)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sessionId] = useState(() => crypto.randomUUID())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return
    const userMessage = message.trim()
    setInput('')
    setMessages(prev => [...prev, { id: nextId.current++, role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const { data } = await publicApi.post(`/api/public/${shareCode}/chat`, {
        message: userMessage,
        conversationId,
        sessionId,
      })
      if (data.conversationId) setConversationId(data.conversationId)
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: 'assistant',
        content: data.message,
        evidence: data.evidence ?? [],
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: 'assistant',
        content: '답변을 가져오는 데 문제가 발생했습니다. 다시 시도해 주세요.',
      }])
    } finally { setLoading(false) }
  }

  const send = async () => sendMessage(input)

  if (dark) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
              <MessageSquareText className="size-5" />
            </span>
            <div>
              <p className="text-[#c4b5fd] font-semibold text-sm">AI 가이드</p>
              <p className="text-[#64748b] text-xs">이 포트폴리오 근거로 답변합니다</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
          {suggestedQuestions.length > 0 && messages.length === 1 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#64748b]">추천 질문</p>
              <div className="space-y-1.5">
                {suggestedQuestions.slice(0, 3).map(question => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    disabled={loading}
                    className="block w-full rounded-lg border border-white/10 bg-[#0b1020] px-3 py-2 text-left text-xs leading-5 text-[#cbd5e1] transition-colors hover:border-violet-300/35 hover:text-white disabled:opacity-45"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#6d28d9] text-white rounded-br-sm'
                  : 'bg-white/[0.055] border border-white/10 text-[#cbd5e1] rounded-bl-sm'
              }`}>
                {msg.content}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.evidence.map(item => (
                      <span key={`${msg.id}-${item.fileId}`} className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-2 py-0.5 text-[10px] text-emerald-200">
                        <FileCheck2 className="size-3" />
                        <span className="truncate">{item.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.055] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#475569] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-[#6d28d9] placeholder:text-[#475569]"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-4 py-2 rounded-xl transition-colors"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    )
  }

  // Light theme (existing — unchanged)
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-pink-500">
        <p className="flex items-center gap-2 text-white font-semibold text-sm">
          <MessageSquareText className="size-4" />
          이 포트폴리오에 대해 질문하기
        </p>
        <p className="text-purple-100 text-xs">VaultSage AI 기반 답변</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              {msg.content}
              {msg.evidence && msg.evidence.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.evidence.map(item => (
                    <span key={`${msg.id}-${item.fileId}`} className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                      <FileCheck2 className="size-3" />
                      <span className="truncate">{item.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="질문을 입력하세요..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  )
}
