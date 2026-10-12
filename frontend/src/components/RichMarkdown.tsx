import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { CodeBlock } from './CodeBlock'

const COURSE_ASSET_ROOT = 'course-assets'

function normalizeCourseAssetUrl(parts: string[]): string {
  const stack: string[] = []

  for (const raw of parts) {
    if (!raw || raw === '.') continue
    if (raw === '..') {
      if (stack.length > 1) stack.pop()
      continue
    }
    stack.push(raw)
  }

  if (stack[0] !== COURSE_ASSET_ROOT) {
    stack.unshift(COURSE_ASSET_ROOT)
  }

  return `/${stack.join('/')}`
}

export function resolveCourseAsset(
  src: string | undefined,
  assetBase: string,
): string | undefined {
  if (!src) return src

  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('//') ||
    src.startsWith('data:')
  ) {
    return src
  }

  if (src.startsWith('/') && !src.startsWith('/course-assets/')) {
    return src
  }

  let relative = src.replace(/\\/g, '/')
  if (relative.startsWith('/course-assets/')) {
    return normalizeCourseAssetUrl(relative.slice(1).split('/'))
  }

  const baseParts = assetBase
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean)

  if (
    baseParts[baseParts.length - 1] === 'Lesson' &&
    /^(?:\.\/)?Pictures?\//i.test(relative)
  ) {
    relative = `../${relative.replace(/^\.\//, '')}`
  }

  return normalizeCourseAssetUrl([...baseParts, ...relative.split('/')])
}

export function RichMarkdown({
  children,
  assetBase = '',
}: {
  children: string
  assetBase?: string
}) {
  return (
    <div className="md-body">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          img({ src, alt, ...props }) {
            const resolvedSrc = resolveCourseAsset(src, assetBase)

            return (
              <img
                src={resolvedSrc}
                alt={alt || ''}
                {...props}
              />
            )
          },

          code({ className, children: body, ...props }) {
            const text = String(body).replace(/\n$/, '')
            const lang = /language-([\w#+]+)/.exec(className || '')?.[1] || ''
            const fenced = Boolean(className) || text.includes('\n')
            if (!fenced) {
              return (
                <code className="inline-code" {...props}>
                  {text}
                </code>
              )
            }
            return <CodeBlock code={text} lang={lang} />
          },

          pre({ children: body }) {
            return <>{body}</>
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}