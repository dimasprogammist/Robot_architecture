import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'

export function Tip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  if (!label) return children
  if (isValidElement(children)) {
    const el = children as ReactElement<{ title?: string; 'aria-label'?: string }>
    return cloneElement(el, {
      title: el.props.title || label,
      'aria-label': el.props['aria-label'] || label,
    })
  }
  return (
    <span title={label} className="tip-wrap">
      {children}
    </span>
  )
}
