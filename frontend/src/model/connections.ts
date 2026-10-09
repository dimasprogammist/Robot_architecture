export function storedConnectionHandles(handles?: { sourceHandle?: string | null; targetHandle?: string | null }) {
  return {
    source_handle: handles?.sourceHandle || '',
    target_handle: handles?.targetHandle || '',
  }
}

export function restoreConnectionHandles(connection: { source_handle?: string; target_handle?: string }) {
  return {
    sourceHandle: connection.source_handle || undefined,
    targetHandle: connection.target_handle || undefined,
  }
}
