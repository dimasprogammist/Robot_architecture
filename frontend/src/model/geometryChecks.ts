import { applyCardSize, parseCardDimension, resolvedCardSize, typeDefaultSize } from './cardSize'
import { storedConnectionHandles, restoreConnectionHandles } from './connections'
import {
  rfTerminalHandleIds,
  terminalAnchor,
  terminalsFor,
} from './terminals'
import {
  COMPONENT_PALETTE,
  PROTOCOL_PALETTE,
  componentPaletteConfig,
  protocolPaletteConfig,
} from '../components/ColorSwatches'
import { PROTOCOL_CARD_CONFIG } from './protocolCard'

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message)
}

function almost(a: number, b: number, eps = 0.01) {
  assert(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`)
}

const klemnik = { type: 'Клеммник', name: 'Клеммник', category: 'ELECTRICAL' as const }

export function runGeometryChecks() {
  const parsed = parseCardDimension('160', 176)
  assert(parsed === 160, 'parse 160')
  assert(parseCardDimension('160,5', 0) === 160.5, 'locale comma')
  assert(parseCardDimension('', 176) === 176, 'empty fallback')
  assert(parseCardDimension('abc', 176) === 176, 'invalid fallback')

  const min = typeDefaultSize(klemnik)
  const below = applyCardSize(klemnik, 10, 10)
  assert(below.width === min.width && below.height === min.height, 'min = library default')

  const typed = applyCardSize(klemnik, 240, 160)
  assert(typed.width === 240 && typed.height === 160, 'typed size in model units')
  const again = applyCardSize({ ...klemnik, ...typed }, typed.width, typed.height)
  assert(again.width === 240 && again.height === 160, 'no double scale')
  const restored = resolvedCardSize({ ...klemnik, width: typed.width, height: typed.height })
  assert(restored.width === 240 && restored.height === 160, 'restore size')

  const terms = terminalsFor({ ...klemnik, extra_fields: { terminal_inputs: '4', terminal_outputs: '4' } })
  const left = terms.filter((t) => t.position === 'left')
  assert(left.length === 4, '4 left pins')
  const offsets = left.map((t) => t.offset)
  assert(new Set(offsets).size === offsets.length, 'unique offsets')
  almost(offsets[0], 20)
  almost(offsets[1], 40)
  almost(offsets[2], 60)
  almost(offsets[3], 80)

  const idsBefore = terms.map((t) => t.id).join(',')
  const idsAfter = terminalsFor({ ...klemnik, extra_fields: { terminal_inputs: '4', terminal_outputs: '4' } })
    .map((t) => t.id)
    .join(',')
  assert(idsBefore === idsAfter, 'stable terminal ids')

  const small = { width: min.width, height: min.height }
  const large = { width: 320, height: 200 }
  const a = terminalAnchor(left[0], small)
  const b = terminalAnchor(left[0], large)
  assert(a.x === 0 && b.x === 0, 'left edge')
  assert(b.y > a.y, 'pin follows height')

  const handles = rfTerminalHandleIds('in-1')
  const stored = storedConnectionHandles({ sourceHandle: handles.source, targetHandle: 'out-1-tgt' })
  assert(stored.source_handle === 'in-1-src', 'store source handle')
  const round = restoreConnectionHandles(stored)
  assert(round.sourceHandle === 'in-1-src' && round.targetHandle === 'out-1-tgt', 'restore handles')

  const archStored = storedConnectionHandles({ sourceHandle: 'right-src', targetHandle: 'left-tgt' })
  assert(archStored.source_handle === 'right-src', 'architecture handles')
  const tableStored = storedConnectionHandles({ sourceHandle: 'bottom-src', targetHandle: 'top-tgt' })
  assert(tableStored.target_handle === 'top-tgt', 'database handles')

  const motor = terminalsFor({ type: 'АД', name: 'Двигатель', category: 'ELECTRICAL', extra_fields: { phases: '3' } })
  const phases = motor.filter((t) => t.id.startsWith('phase-'))
  assert(phases.length === 3, 'motor phases')
  assert(new Set(phases.map((t) => t.offset)).size === 3, 'motor offsets unique')

  const plc = terminalsFor({ type: 'ПЛК', name: 'ПЛК', category: 'ELECTRICAL', extra_fields: {} })
  assert(plc.length > 4, 'plc pins')

  const board = terminalsFor({ type: 'MCU', name: 'Arduino', category: 'HARDWARE', extra_fields: {} })
  assert(board.length > 2, 'board pins')

  const colors = componentPaletteConfig()
  assert(colors.layout === 'row' && colors.rows === 1 && colors.wrap === false, 'component palette row')
  assert(COMPONENT_PALETTE.length === 32, 'component colors available')
  const proto = protocolPaletteConfig()
  assert(proto.count === 32 && proto.columns === 8 && proto.rows === 4, 'protocol 8x4')
  assert(PROTOCOL_PALETTE.length === 32, '32 protocol colors')
  assert(PROTOCOL_CARD_CONFIG.deleteButtonClass === 'btn danger', 'red delete')
  assert(PROTOCOL_CARD_CONFIG.paletteLayout === 'grid', 'protocol card uses grid palette')
  assert(PROTOCOL_CARD_CONFIG.fields.includes('delete'), 'delete stays on card')
}

runGeometryChecks()
console.log('geometryChecks: ok')
