'use client'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import OrganizerBanner from './OrganizerBanner'
import CategoryColumn from './CategoryColumn'
import OrganizerReasoning from './OrganizerReasoning'

const MOCK_CATEGORIES = [
  {
    key: 'system', label: '시스템', subtitle: '토큰 · 가이드 · 컴포넌트',
    fileCount: 2,
    files: [
      { fileId: '1', name: 'Brand system.pdf', size: 4404019, confidence: 98, locked: false },
      { fileId: '2', name: 'Color tokens.json', size: 12288, confidence: 96, locked: false },
    ],
  },
  {
    key: 'visual', label: '비주얼', subtitle: '키 비주얼 · 무드 · 마이크로사이트',
    fileCount: 3,
    files: [
      { fileId: '3', name: 'Hero key visual.png', size: 1887437, confidence: 99, locked: false },
      { fileId: '4', name: 'Concept board.jpg', size: 3250585, confidence: 94, locked: false },
      { fileId: '5', name: 'Microsite hifi.fig', size: 25165824, confidence: 91, locked: false },
    ],
  },
  {
    key: 'document', label: '문서', subtitle: '노트 · 리서치 · 의사결정',
    fileCount: 2,
    files: [
      { fileId: '6', name: 'Process journal.md', size: 34816, confidence: 92, locked: false },
      { fileId: '7', name: 'Research notes.md', size: 53248, confidence: 89, locked: false },
    ],
  },
  {
    key: 'deliverable', label: '산출물', subtitle: '최종 산출물 · 납품',
    fileCount: 1,
    files: [
      { fileId: '8', name: 'Final delivery.zip', size: 134217728, confidence: 95, locked: false },
    ],
  },
]

const MOCK_REASONING =
  'Brand system.pdf와 Color tokens.json은 "재사용 가능한 시스템 정의"라는 의미가 가깝습니다. ' +
  'Microsite hifi.fig는 최종 비주얼 산출물로 비주얼 카테고리에 해당해요. ' +
  '결정이 마음에 들지 않으면 카드를 드래그해 옮기세요.'

interface Props { portfolioId: string }

export default function SmartOrganizerView({ portfolioId }: Props) {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: '#070b15', color: '#fff' }}>
      {/* Top nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(7,11,21,0.85)', backdropFilter: 'blur(12px)',
        padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          AI 파일 정리
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 9999, fontSize: 12,
            background: 'rgba(167,139,250,0.12)', color: '#c4b5fd',
          }}>
            AI 분류 완료 · 100%
          </span>
          <button
            style={{ fontSize: 13, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
            onClick={() => router.push(`/portfolios/${portfolioId}`)}
          >
            건너뛰기
          </button>
          <button
            onClick={() => router.push(`/portfolios/${portfolioId}`)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg,#7c3aed,#0e7490)',
              color: '#fff', border: 'none', cursor: 'pointer',
            }}
          >
            분류 결과 확정 <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 40px 40px' }}>
        <OrganizerBanner
          totalFiles={8}
          classifiedFiles={8}
          progressPercent={100}
          status="done"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {MOCK_CATEGORIES.map(cat => (
            <CategoryColumn
              key={cat.key}
              categoryKey={cat.key}
              label={cat.label}
              subtitle={cat.subtitle}
              files={cat.files}
            />
          ))}
        </div>
        <OrganizerReasoning reasoning={MOCK_REASONING} />
      </div>
    </div>
  )
}
