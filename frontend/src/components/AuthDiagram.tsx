function Node({ x, y, w, h, label, accent }: { x: number | string; y: number | string; w: number | string; h: number | string; label: string; accent?: boolean }) {
  const nx = Number(x)
  const ny = Number(y)
  const nw = Number(w)
  const nh = Number(h)
  return (
    <g>
      <rect
        x={nx}
        y={ny}
        width={nw}
        height={nh}
        rx="8"
        stroke="currentColor"
        strokeOpacity="0.55"
        fill={accent ? 'var(--accent-soft)' : 'var(--surface)'}
      />
      <text x={nx + 12} y={ny + nh / 2 + 4} fontSize="11" fill="var(--ink)">
        {label}
      </text>
    </g>
  )
}

function Link({ d }: { d: string }) {
  return <path d={d} stroke="currentColor" strokeOpacity="0.4" fill="none" markerEnd="url(#auth-arrow)" />
}

function Spark({ x, y, points, label }: { x: number | string; y: number | string; points: string; label: string }) {
  const nx = Number(x)
  const ny = Number(y)
  return (
    <g>
      <rect x={nx} y={ny} width="108" height="56" rx="8" stroke="currentColor" strokeOpacity="0.35" fill="var(--surface)" />
      <text x={nx + 10} y={ny + 14} fontSize="9" fill="var(--muted)">{label}</text>
      <polyline points={points} fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.4" />
    </g>
  )
}

export function AuthDiagram() {
  return (
    <svg className="auth-diagram" viewBox="0 0 640 360" fill="none" aria-hidden="true">
      <defs>
        <marker id="auth-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0 0 L7 3.5 L0 7 Z" fill="currentColor" fillOpacity="0.45" />
        </marker>
      </defs>
      <Node x="24" y="18" w="100" h="40" label="Сервер" accent />
      <Node x="160" y="18" w="100" h="40" label="БД" />
      <Node x="300" y="48" w="100" h="40" label="IPC" accent />
      <Node x="448" y="18" w="88" h="40" label="Камера" />
      <Node x="548" y="18" w="72" h="40" label="LiDAR" />
      <Node x="24" y="140" w="100" h="40" label="MCU" />
      <Node x="160" y="140" w="100" h="40" label="ПЛК" accent />
      <Node x="300" y="140" w="100" h="40" label="Привод" />
      <Node x="448" y="140" w="88" h="40" label="Двигатель" />
      <Node x="24" y="248" w="100" h="40" label="Датчики" />
      <Node x="160" y="248" w="100" h="40" label="Хранилище" />
      <Link d="M124 38 H160" />
      <Link d="M260 38 H300 68" />
      <Link d="M400 68 H448 38" />
      <Link d="M536 38 H548" />
      <Link d="M350 88 V140" />
      <Link d="M74 58 V140" />
      <Link d="M210 58 V140" />
      <Link d="M124 160 H160" />
      <Link d="M260 160 H300" />
      <Link d="M400 160 H448" />
      <Link d="M74 180 V248" />
      <Link d="M210 180 V248" />
      <Link d="M350 180 V220 H210" />
      <Spark x="448" y="232" points="458,276 478,268 498,272 518,250 538,258 548,246" label="Скорость" />
      <Spark x="300" y="232" points="310,276 330,270 350,262 370,266 390,248 400,252" label="Нагрузка" />
    </svg>
  )
}
