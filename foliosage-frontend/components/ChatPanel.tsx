'use client'
import { useState, useRef, useEffect } from 'react'
import { FileCheck2, MessageSquareText, Send } from 'lucide-react'
import publicApi from '@/lib/publicApi'

interface EvidenceChip { fileId: string; vaultsageFileId: string; name: string }
interface Message { id: number; role: 'user' | 'assistant'; content: string; evidence?: EvidenceChip[] }
interface Props { shareCode: string; dark?: boolean; suggestedQuestions?: string[] }

function AssistantContent({ content }: { content: string }) {
  const lines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
  const blocks: { type: 'p' | 'li'; text: string }[] = []

  for (const line of lines) {
    if (!line) continue
    const bullet = line.match(/^[-*]\s+(.+)$/)
    const numbered = line.match(/^\d+[.)]\s+(.+)$/)
    if (bullet || numbered) {
      blocks.push({ type: 'li', text: bullet?.[1] ?? numbered?.[1] ?? line })
    } else {
      blocks.push({ type: 'p', text: line })
    }
  }

  if (blocks.length === 0) return null

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => block.type === 'li' ? (
        <div key={`${index}-${block.text}`} className="flex gap-2 leading-6">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-55" />
          <span>{block.text}</span>
        </div>
      ) : (
        <p key={`${index}-${block.text}`} className="leading-6">{block.text}</p>
      ))}
    </div>
  )
}

export default function ChatPanel({ shareCode, dark = false, suggestedQuestions = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: 'Hi. Ask me anything about this portfolio.' }
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
        content: 'I could not load an answer. Please try again.',
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
              <p className="text-[#c4b5fd] font-semibold text-sm">AI Guide</p>
              <p className="text-[#64748b] text-xs">Answers from this portfolio's evidence</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
          {suggestedQuestions.length > 0 && messages.length === 1 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#64748b]">Suggested questions</p>
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
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#6d28d9] text-white rounded-br-sm'
                  : 'bg-white/[0.065] border border-white/10 text-[#dbe4f0] rounded-bl-sm shadow-[0_12px_40px_rgba(0,0,0,0.18)]'
              }`}>
                {msg.role === 'assistant' ? <AssistantContent content={msg.content} /> : msg.content}
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
            placeholder="Ask a question..."
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
          Ask about this portfolio
        </p>
        <p className="text-purple-100 text-xs">Answers powered by VaultSage AI</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-sm'
                : 'bg-slate-100 text-slate-800 rounded-bl-sm shadow-sm'
            }`}>
              {msg.role === 'assistant' ? <AssistantContent content={msg.content} /> : msg.content}
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
          placeholder="Ask a question..."
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
