import {
  Box,
  Camera,
  CircuitBoard,
  Cloud,
  Cpu,
  Database,
  Factory,
  Folder,
  Globe,
  Layout,
  Layers,
  Puzzle,
  Radar,
  Radio,
  Server,
  User,
  Workflow,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const map: Record<string, LucideIcon> = {
  box: Box,
  app: Layers,
  service: Workflow,
  server: Server,
  layout: Layout,
  book: Folder,
  puzzle: Puzzle,
  api: Radio,
  chip: CircuitBoard,
  cpu: Cpu,
  board: CircuitBoard,
  factory: Factory,
  sensor: Radar,
  motor: Workflow,
  camera: Camera,
  radar: Radar,
  network: Globe,
  db: Database,
  cache: Database,
  folder: Folder,
  queue: Layers,
  protocol: Radio,
  cloud: Cloud,
  globe: Globe,
  user: User,
}

export function TypeIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = map[name] || Box
  return <Icon size={size} />
}
