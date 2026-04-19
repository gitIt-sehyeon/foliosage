import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <nav className="flex justify-between items-center px-8 py-5">
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          FolioSage
        </span>
        <div className="flex gap-3">
          <Link href="/login"><Button variant="ghost" className="text-white">Login</Button></Link>
          <Link href="/signup"><Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button></Link>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center text-center px-4 py-32">
        <h1 className="text-6xl font-bold mb-6 leading-tight">
          Your portfolio<br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            talks back
          </span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl">
          Upload your work. AI organizes it. Visitors chat with it.
          Every file gets a creation certificate — proof it&apos;s yours.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-10 py-6 text-lg">
            Create Your Portfolio
          </Button>
        </Link>
      </div>
      <div className="flex justify-center gap-16 pb-20 text-center">
        {[
          { icon: '🤖', title: 'AI Auto-Organize', desc: 'Smart Organizer categorizes files by project' },
          { icon: '💬', title: 'Portfolio Chat', desc: 'Visitors ask questions, AI answers from your files' },
          { icon: '📜', title: 'Creation Certificate', desc: 'SHA-256 + timestamp proof for every file' },
        ].map(f => (
          <div key={f.title} className="max-w-xs">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
