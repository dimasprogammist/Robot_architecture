import { applyCardSize, electricalCardSize, parseCardDimension, resolvedCardSize, typeDefaultSize } from './cardSize'
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
import {
  canListOnPowerLibrary,
  collectOwnedIds,
  ensureArchitectureSource,
  ensurePowerView,
  hasElectricalAspect,
  pruneDanglingGraph,
  pruneOrphanAlgorithms,
  removeComponentsAndDependents,
  syncArchitectureFromPower,
} from './canvasSync'
import { nodeColor, pointOnNode } from './minimapGeometry'
import { resolvedPins } from './controllerPins'
import { definitionFor, groupedComponentFields } from './componentCatalog'
import { canonicalComponentId } from './canonical'
import {
  collectPersistableNodeChanges,
  positionNeedsWrite,
  selectionIdsEqual,
  sizeNeedsWrite,
} from './canvasNodeSync'
import { Position } from '@xyflow/react'

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

  const uno = resolvedPins({ name: 'Arduino', type: 'MCU', extra_fields: { model: 'Arduino Uno' } })
  assert(uno.maxDi === 14 && uno.maxAi === 6 && uno.ao === 0, 'uno pin budget')
  const mega = resolvedPins({ name: 'Arduino Mega', type: 'MCU', extra_fields: { model: 'Arduino Mega' } })
  assert(mega.maxDi === 54 && mega.maxAi === 16, 'mega differs from uno')
  const board = terminalsFor({
    type: 'MCU',
    name: 'Arduino',
    category: 'HARDWARE',
    extra_fields: { model: 'Arduino Uno', pin_di: '2', pin_do: '2', pin_ai: '2', pin_ao: '0' },
  })
  assert(board.some((t) => t.id === 'di-1') && board.some((t) => t.id === 'do-2'), 'configurable io pins')
  assert(board.filter((t) => t.id.startsWith('di-')).length === 2, 'di count')
  assert(
    hasElectricalAspect({ type: 'MCU', name: 'Arduino', category: 'HARDWARE', extra_fields: {} }),
    'arduino has electrical view',
  )
  assert(
    !hasElectricalAspect({ type: 'Язык', name: 'Python', category: 'SOFTWARE', extra_fields: {} }),
    'python has no fake pins',
  )
  const sized = electricalCardSize({ name: 'Arduino', type: 'MCU', category: 'HARDWARE', extra_fields: {} })
  assert(sized.height >= 156, 'arduino card grows with pins')
  assert(definitionFor({ name: 'Raspberry Pi 4', type: 'SBC', category: 'HARDWARE' })?.id === 'sbc', 'rpi catalog')
  assert(definitionFor({ name: 'STM32', type: 'MCU', category: 'HARDWARE' })?.id === 'mcu', 'stm32 catalog')
  assert(definitionFor({ name: 'Arduino Uno', type: 'MCU', category: 'HARDWARE' })?.id === 'mcu', 'arduino catalog')
  assert(definitionFor({ name: 'ПЛК', type: 'ПЛК', category: 'HARDWARE' })?.id === 'plc', 'plc catalog')
  assert(
    terminalsFor({ name: 'Raspberry Pi 4', type: 'SBC', category: 'HARDWARE' } as never).length > 0,
    'rpi terminals without extra_fields',
  )
  assert(
    groupedComponentFields({
      id: 'x',
      name: 'STM32',
      type: 'MCU',
      category: 'HARDWARE',
      architecture_id: 'a',
      position: { x: 0, y: 0 },
    } as never).length > 0,
    'inspector fields without extra_fields',
  )

  const colors = componentPaletteConfig()
  assert(colors.layout === 'row' && colors.rows === 1 && colors.wrap === false, 'component palette row')
  assert(COMPONENT_PALETTE.length === 32, 'component colors available')
  const proto = protocolPaletteConfig()
  assert(proto.count === 32 && proto.columns === 8 && proto.rows === 4, 'protocol 8x4')
  assert(PROTOCOL_PALETTE.length === 32, '32 protocol colors')
  assert(PROTOCOL_CARD_CONFIG.deleteButtonClass === 'btn danger', 'red delete')
  assert(PROTOCOL_CARD_CONFIG.paletteLayout === 'grid', 'protocol card uses grid palette')
  assert(PROTOCOL_CARD_CONFIG.fields.includes('delete'), 'delete stays on card')

  const graph = {
    architectures: [
      { id: 'root', parent_component_id: null },
      { id: 'nested', parent_component_id: 'py' },
    ],
    components: [
      { id: 'py', architecture_id: 'root', extra_fields: {} },
      { id: 'inner', architecture_id: 'nested', extra_fields: {} },
      { id: 'clone', architecture_id: 'pwr', extra_fields: { source_component_id: 'py' } },
    ],
    connections: [{ id: 'e1', source: 'py', target: 'inner' }],
    algorithms: [{ component_id: 'py' }, { component_id: 'inner' }, { component_id: 'ghost' }],
    requirements: [{ component_ids: ['py', 'keep'], connection_ids: ['e1'] }],
    mechanics: null,
  }
  const owned = collectOwnedIds(graph as never, ['py'])
  assert(owned.has('inner') && owned.has('clone') && owned.has('py'), 'delete cascades nested and power clone')
  removeComponentsAndDependents(graph as never, ['py'])
  assert(graph.components.length === 0, 'owned components removed')
  assert(graph.algorithms.length === 1 && graph.algorithms[0].component_id === 'ghost', 'algorithms of deleted owners dropped')
  pruneOrphanAlgorithms(graph as never)
  assert(graph.algorithms.length === 0, 'orphan algorithms pruned')

  const dangling = {
    architectures: [
      { id: 'root', parent_component_id: null, kind: 'system' },
      { id: 'nested', parent_component_id: 'missing-soft', kind: 'system' },
    ],
    components: [{ id: 'inner-alg-owner', architecture_id: 'nested', extra_fields: {} }],
    algorithms: [{ component_id: 'inner-alg-owner' }, { component_id: 'standalone-missing' }],
    connections: [],
  }
  const pruned = pruneDanglingGraph(dangling as never)
  assert(pruned.removedComps === 1, 'dangling nested components removed')
  assert(pruned.removedAlgs === 2, 'algorithms of missing owners pruned')
  assert(dangling.components.length === 0, 'no leftover nested software nodes')

  const py = {
    id: 'py',
    architecture_id: 'root',
    name: 'Python',
    type: 'Язык',
    category: 'SOFTWARE',
    extra_fields: {},
  }
  const projLib = {
    architectures: [
      { id: 'root', kind: 'system', parent_component_id: null },
      { id: 'pwr', kind: 'power', parent_component_id: null },
    ],
    components: [py],
  }
  assert(!canListOnPowerLibrary(py as never, projLib as never), 'python not listed on power library')

  const pinPt = pointOnNode(
    {
      id: 'a',
      position: { x: 10, y: 20 },
      width: 100,
      height: 40,
      handles: [{ id: 'right-src', x: 96, y: 16, width: 8, height: 8, position: Position.Right }],
    },
    'right-src',
  )
  almost(pinPt.x, 10 + 96 + 4)
  almost(pinPt.y, 20 + 16 + 4)
  const table = { id: 't', position: { x: 0, y: 0 }, width: 200, height: 80 }
  const fromRight = pointOnNode(table, undefined, 'source')
  const toLeft = pointOnNode(table, 'left-tgt', 'target')
  assert(fromRight.x === 200 && fromRight.y === 40, 'source without handle sits on right edge')
  assert(toLeft.x === 0 && toLeft.y === 40, 'table target uses left border, not center')
  const namedTop = pointOnNode(table, 'top-src', 'source')
  assert(namedTop.x === 100 && namedTop.y === 0, 'top handle stays on top edge')
  const mcu = {
    id: 'mcu',
    position: { x: 0, y: 0 },
    width: 200,
    height: 80,
    component: {
      type: 'MCU',
      name: 'Arduino Uno',
      category: 'HARDWARE' as const,
      extra_fields: { pin_di: '1', pin_do: '0', pin_ai: '0', pin_ao: '0' },
    },
  }
  const diPin = pointOnNode(mcu, 'di-1-src', 'source')
  assert(diPin.x === 0, 'DI pin stays on the left; -src suffix is not a side')
  assert(nodeColor('#3a6') === '#3a6', 'minimap keeps component color')
  assert(nodeColor(undefined) !== '#3a6', 'fallback differs from explicit color')

  const p = {
    id: 'p',
    root_architecture_id: 'root',
    architectures: [
      { id: 'root', project_id: 'p', name: 's', parent_component_id: null, description: '', kind: 'system' },
      { id: 'pwr', project_id: 'p', name: 'pwr', parent_component_id: null, description: '', kind: 'power' },
    ],
    components: [
      {
        id: 'pwr-uno',
        architecture_id: 'pwr',
        name: 'Arduino',
        type: 'MCU',
        category: 'HARDWARE',
        description: '',
        icon: '',
        technology: '',
        color: '#112233',
        extra_fields: {},
        position: { x: 40, y: 40 },
        width: 160,
        height: 90,
      },
    ],
    connections: [],
    algorithms: [],
  }
  const sid = ensureArchitectureSource(p as never, 'pwr-uno')
  assert(typeof sid === 'string' && sid.length > 0, 'power view gets architecture source')
  assert(p.components.length === 2, 'no duplicate from reverse sync')
  const src = p.components.find((c) => c.id === sid)
  assert(src?.architecture_id === 'root', 'source lives on architecture')
  const againSrc = ensureArchitectureSource(p as never, 'pwr-uno')
  assert(againSrc === sid && p.components.length === 2, 'reverse sync is idempotent')
  syncArchitectureFromPower(p as never)
  assert(p.components.length === 2, 'syncArchitectureFromPower does not clone again')
  const viewId = ensurePowerView(p as never, sid as string)
  assert(viewId === 'pwr-uno', 'existing power view reused')
  assert(canonicalComponentId(p as never, 'pwr-uno') === sid, 'power view canonical id is architecture source')

  const measured = collectPersistableNodeChanges(
    [{ type: 'dimensions', id: 'n1', dimensions: { width: 200, height: 120 } }],
    false,
  )
  assert(measured.sizes.length === 0, 'layout measurement is not persisted')
  const echoed = collectPersistableNodeChanges(
    [{ type: 'position', id: 'n1', position: { x: 10, y: 20 }, dragging: false }],
    false,
  )
  assert(echoed.positions.length === 1, 'position events are collected')
  assert(!positionNeedsWrite({ x: 10, y: 20 }, { x: 10, y: 20 }), 'identical position is skipped')
  const liveResize = collectPersistableNodeChanges(
    [{ type: 'dimensions', id: 'n1', resizing: true, dimensions: { width: 220, height: 130 } }],
    false,
  )
  assert(liveResize.sizes.length === 1 && liveResize.resizing, 'user resize is persisted')
  const finishResize = collectPersistableNodeChanges(
    [{ type: 'dimensions', id: 'n1', resizing: false, dimensions: { width: 220, height: 130 } }],
    true,
  )
  assert(finishResize.sizes.length === 1 && !finishResize.resizing, 'resize end is persisted once')
  assert(!sizeNeedsWrite({ width: 220, height: 130 }, { width: 220, height: 130 }), 'identical size is skipped')
  assert(selectionIdsEqual(['a'], ['a']) && !selectionIdsEqual(['a'], ['b']), 'selection compare')
}

runGeometryChecks()
console.log('geometryChecks: ok')
