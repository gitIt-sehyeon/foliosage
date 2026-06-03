'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceY,
  type Simulation, type SimulationNodeDatum,
} from 'd3-force'
import type { OrganizerTree, TreeNode } from './useOrganizerTree'

type NodeType = 'root' | 'folder' | 'file'

interface GNode extends SimulationNodeDatum {
  id: string
  label: string
  type: NodeType
  depth: number
  r: number
  category?: string | null
  size?: number | null
}
interface GLink { source: string; target: string }

interface RNode { id: string; label: string; type: NodeType; r: number; x: number; y: number; category?: string | null; size?: number | null }
interface RLink { s: string; t: string; sx: number; sy: number; tx: number; ty: number }

const ROOT_COLOR = '#a78bfa'
const FOLDER_COLOR = '#38bdf8'
// File nodes are tinted by their 4-category classification (mirrors CategoryColumn.tsx).
const CATEGORY_COLOR: Record<string, string> = {
  system: '#c4b5fd',
  visual: '#67e8f9',
  document: '#fde68a',
  deliverable: '#6ee7b7',
}
const FILE_FALLBACK = '#94a3b8'
const CATEGORY_LEGEND = [
  { key: 'system', label: 'System' },
  { key: 'visual', label: 'Visual' },
  { key: 'document', label: 'Document' },
  { key: 'deliverable', label: 'Deliverable' },
]

function fileColor(category?: string | null) {
  return (category && CATEGORY_COLOR[category]) || FILE_FALLBACK
}
function nodeColor(n: { type: NodeType; category?: string | null }) {
  return n.type === 'root' ? ROOT_COLOR : n.type === 'folder' ? FOLDER_COLOR : fileColor(n.category)
}
function fmtSize(b?: number | null) {
  if (!b && b !== 0) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

// Flatten the folder tree into a single connected graph anchored on a virtual root.
function buildGraph(tree: OrganizerTree): { nodes: GNode[]; links: GLink[] } {
  const nodes: GNode[] = []
  const links: GLink[] = []
  const ROOT = '__root__'
  nodes.push({ id: ROOT, label: 'Portfolio', type: 'root', depth: 0, r: 18 })

  const walk = (node: TreeNode, parentId: string, depth: number) => {
    const weight = node.fileCount + node.childCount
    nodes.push({
      id: node.id,
      label: node.name,
      type: 'folder',
      depth,
      r: Math.min(15, 9 + Math.sqrt(weight) * 1.5),
    })
    links.push({ source: parentId, target: node.id })
    node.files.forEach(f => {
      nodes.push({ id: f.fileId, label: f.name, type: 'file', depth: depth + 1, r: 7, category: f.category, size: f.size })
      links.push({ source: node.id, target: f.fileId })
    })
    node.children.forEach(c => walk(c, node.id, depth + 1))
  }
  tree.nodes.forEach(n => walk(n, ROOT, 1))
  return { nodes, links }
}

interface Props { tree: OrganizerTree; height?: number }

export default function OrganizerGraph({ tree, height = 520 }: Props) {
  const { nodes, links } = useMemo(() => buildGraph(tree), [tree])
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const [frame, setFrame] = useState<{ nodes: RNode[]; links: RLink[] }>({ nodes: [], links: [] })
  const [mounted, setMounted] = useState(false)

  const simRef = useRef<Simulation<GNode, undefined> | null>(null)
  const nodesRef = useRef<GNode[]>([])
  const linksRef = useRef<{ source: GNode; target: GNode }[]>([])

  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [hover, setHover] = useState<string | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  const dragRef = useRef<{ id: string | null; panning: boolean; sx: number; sy: number; vx: number; vy: number }>(
    { id: null, panning: false, sx: 0, sy: 0, vx: 0, vy: 0 },
  )

  const snapshot = useCallback(() => {
    setFrame({
      nodes: nodesRef.current.map(n => ({
        id: n.id, label: n.label, type: n.type, r: n.r, x: n.x ?? 0, y: n.y ?? 0, category: n.category, size: n.size,
      })),
      links: linksRef.current.map(l => ({
        s: l.source.id, t: l.target.id,
        sx: l.source.x ?? 0, sy: l.source.y ?? 0, tx: l.target.x ?? 0, ty: l.target.y ?? 0,
      })),
    })
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    setWidth(el.clientWidth)
    const t = setTimeout(() => setMounted(true), 30)
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])

  useEffect(() => {
    const simNodes = nodes.map(n => ({ ...n }))
    const simLinks = links.map(l => ({ ...l }))
    nodesRef.current = simNodes
    linksRef.current = simLinks as unknown as { source: GNode; target: GNode }[]

    const sim = forceSimulation<GNode>(simNodes)
      .force('charge', forceManyBody<GNode>().strength(d => -120 - d.r * 8))
      .force('link', forceLink<GNode, GLink>(simLinks as unknown as GLink[])
        .id(d => d.id)
        .distance(l => ((l as unknown as { target: GNode }).target.type === 'file' ? 42 : 90))
        .strength(0.55))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide<GNode>().radius(d => d.r + 10))
      .force('x', forceX(width / 2).strength(0.02))
      .force('y', forceY(height / 2).strength(0.02))
      .alphaTarget(0.012) // keep the graph gently "breathing" so it never fully freezes
      .alphaDecay(0.02)

    sim.on('tick', snapshot)
    simRef.current = sim
    snapshot()
    return () => { sim.stop() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links])

  useEffect(() => {
    const sim = simRef.current
    if (!sim) return
    sim.force('center', forceCenter(width / 2, height / 2))
    sim.force('x', forceX(width / 2).strength(0.02))
    sim.force('y', forceY(height / 2).strength(0.02))
    sim.alpha(0.3).restart()
  }, [width, height])

  // ── interaction ───────────────────────────────────────────────────
  const toGraph = (clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect()
    return { x: (clientX - rect.left - view.x) / view.k, y: (clientY - rect.top - view.y) / view.k }
  }
  const onNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    dragRef.current.id = id
    simRef.current?.alphaTarget(0.3).restart()
  }
  const onBgPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { ...dragRef.current, panning: true, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }
    setGrabbing(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (d.id) {
      const p = toGraph(e.clientX, e.clientY)
      const n = nodesRef.current.find(nn => nn.id === d.id)
      if (n) { n.fx = p.x; n.fy = p.y }
    } else if (d.panning) {
      setView(v => ({ ...v, x: d.vx + (e.clientX - d.sx), y: d.vy + (e.clientY - d.sy) }))
    }
  }
  const onPointerUp = () => {
    const d = dragRef.current
    if (d.id) {
      const n = nodesRef.current.find(nn => nn.id === d.id)
      if (n) { n.fx = null; n.fy = null }
      simRef.current?.alphaTarget(0.012)
    }
    dragRef.current.id = null
    dragRef.current.panning = false
    setGrabbing(false)
  }
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = wrapRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    setView(v => {
      const k = Math.min(3, Math.max(0.3, v.k * factor))
      return { k, x: mx - (mx - v.x) * (k / v.k), y: my - (my - v.y) * (k / v.k) }
    })
  }

  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>()
    links.forEach(l => {
      if (!m.has(l.source)) m.set(l.source, new Set())
      if (!m.has(l.target)) m.set(l.target, new Set())
      m.get(l.source)!.add(l.target)
      m.get(l.target)!.add(l.source)
    })
    return m
  }, [links])
  const neighbors = useMemo(() => {
    if (!hover) return null
    const set = new Set<string>([hover])
    adjacency.get(hover)?.forEach(id => set.add(id))
    return set
  }, [hover, adjacency])
  const isActive = (id: string) => !neighbors || neighbors.has(id)

  const hovered = hover ? frame.nodes.find(n => n.id === hover) : null

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative', width: '100%', height,
        borderRadius: 18, border: '1px solid rgba(255,255,255,0.07)',
        background: 'radial-gradient(120% 120% at 50% 30%, rgba(56,189,248,0.06), rgba(124,58,237,0.05) 35%, rgba(7,11,21,0) 70%), #080d18',
        overflow: 'hidden', cursor: grabbing ? 'grabbing' : 'grab', touchAction: 'none',
        overscrollBehavior: 'contain',
        opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
      }}
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <svg width="100%" height={height} style={{ display: 'block' }}>
        <defs>
          <filter id="og-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="og-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {/* edges (curved) */}
          {frame.links.map((l, i) => {
            const active = !neighbors || (neighbors.has(l.s) && neighbors.has(l.t))
            const mx = (l.sx + l.tx) / 2
            const my = (l.sy + l.ty) / 2 - Math.hypot(l.tx - l.sx, l.ty - l.sy) * 0.12
            return (
              <path
                key={i}
                d={`M${l.sx},${l.sy} Q${mx},${my} ${l.tx},${l.ty}`}
                fill="none"
                stroke={active ? 'rgba(125,211,252,0.5)' : 'rgba(148,163,184,0.12)'}
                strokeWidth={active ? 1.5 : 1}
              />
            )
          })}
          {/* nodes */}
          {frame.nodes.map(n => {
            const active = isActive(n.id)
            const isHover = hover === n.id
            const color = nodeColor(n)
            const labelShown = active
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: 'grab', opacity: active ? 1 : 0.22, transition: 'opacity 0.18s' }}
                onPointerDown={e => onNodePointerDown(e, n.id)}
                onPointerEnter={() => setHover(n.id)}
                onPointerLeave={() => setHover(h => (h === n.id ? null : h))}
              >
                {/* soft halo ring */}
                <circle r={n.r + (isHover ? 7 : 4)} fill={color} opacity={isHover ? 0.22 : 0.12} />
                <circle
                  r={isHover ? n.r + 1.5 : n.r}
                  fill={color}
                  fillOpacity={n.type === 'file' ? 0.92 : 1}
                  stroke={isHover ? '#fff' : 'rgba(8,13,24,0.85)'}
                  strokeWidth={isHover ? 2 : 1.5}
                  filter={isHover ? 'url(#og-glow-strong)' : 'url(#og-glow)'}
                />
                {labelShown && (
                  <text
                    x={0} y={n.r + (n.type === 'file' ? 13 : 15)}
                    textAnchor="middle"
                    style={{
                      fontSize: n.type === 'root' ? 13 : n.type === 'folder' ? 11.5 : 10,
                      fontWeight: n.type === 'file' ? 500 : 700,
                      fill: n.type === 'file' ? '#cbd5e1' : '#f1f5f9',
                      paintOrder: 'stroke',
                      stroke: '#080d18',
                      strokeWidth: 3.5,
                      strokeLinejoin: 'round',
                      pointerEvents: 'none', userSelect: 'none',
                    }}
                  >
                    {n.label.length > 24 ? n.label.slice(0, 22) + '…' : n.label}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* hover tooltip */}
      {hovered && hovered.type === 'file' && (
        <div style={{
          position: 'absolute', top: 12, left: 14, maxWidth: '60%',
          padding: '8px 12px', borderRadius: 10, pointerEvents: 'none',
          background: 'rgba(8,13,24,0.9)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{hovered.label}</p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
            {hovered.category ? hovered.category[0].toUpperCase() + hovered.category.slice(1) : 'Unclassified'}
            {hovered.size != null ? ` · ${fmtSize(hovered.size)}` : ''}
          </p>
        </div>
      )}

      {/* legend */}
      <div style={{
        position: 'absolute', bottom: 12, left: 14, display: 'flex', flexWrap: 'wrap', gap: 12,
        fontSize: 11, color: '#64748b', pointerEvents: 'none',
      }}>
        <Legend color={ROOT_COLOR} label="Portfolio" />
        <Legend color={FOLDER_COLOR} label="Folder" />
        {CATEGORY_LEGEND.map(c => <Legend key={c.key} color={CATEGORY_COLOR[c.key]} label={c.label} />)}
      </div>
      <p style={{
        position: 'absolute', top: 12, right: 16, margin: 0,
        fontSize: 11, color: '#475569', pointerEvents: 'none',
      }}>
        drag · scroll to zoom · drag bg to pan
      </p>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 9, height: 9, borderRadius: 9999, background: color, boxShadow: `0 0 6px ${color}` }} />
      {label}
    </span>
  )
}
