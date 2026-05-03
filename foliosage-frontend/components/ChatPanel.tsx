'use client'
import { useState, useRef, useEffect } from 'react'
import publicApi from '@/lib/publicApi'

interface Message { id: number; role: 'user' | 'assistant'; content: string }
interface Props { shareCode: string; dark?: boolean }

export default function ChatPanel({ shareCode, dark = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', content: '안녕하세요! 이 포트폴리오에 대해 무엇이든 물어보세요 👋' }
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

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
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
      setMessages(prev => [...prev, { id: nextId.current++, role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, {
        id: nextId.current++,
        role: 'assistant',
        content: '답변을 가져오는 데 문제가 발생했습니다. 다시 시도해 주세요.',
      }])
    } finally { setLoading(false) }
  }

  if (dark) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-[#334155] flex-shrink-0">
          <p className="text-[#a78bfa] font-semibold text-sm">💬 AI 채팅</p>
          <p className="text-[#475569] text-xs">Powered by VaultSage AI</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#6d28d9] text-white rounded-br-sm'
                  : 'bg-[#1e293b] text-[#94a3b8] rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b] rounded-2xl rounded-bl-sm px-4 py-2">
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

        <div className="p-3 border-t border-[#334155] flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="질문을 입력하세요..."
            className="flex-1 bg-[#0f172a] border border-[#334155] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#6d28d9] placeholder:text-[#475569]"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-[#6d28d9] hover:bg-[#7c3aed] disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            →
          </button>
        </div>
      </div>
    )
  }

  // Light theme (existing — unchanged)
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-purple-600 to-pink-500">
        <p className="text-white font-semibold text-sm">💬 Ask about this portfolio</p>
        <p className="text-purple-100 text-xs">Powered by VaultSage AI</p>
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
          →
        </button>
      </div>
    </div>
  )
}
