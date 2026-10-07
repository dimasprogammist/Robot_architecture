import type { ReactNode } from 'react'
import Markdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

const DIAGRAM = /[┌┐└┘├┤│─►◄═]/

function highlight(code: string, lang: string): ReactNode[] {
  if (!lang || lang === 'text' || DIAGRAM.test(code)) return [code]

  const patterns: Record<string, RegExp> = {
    python:
      /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')|\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|in|not|and|or|True|False|None|lambda|yield|pass|break|continue)\b|\b(\d+)\b/gm,

    bash:
      /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(git|cd|ls|echo|export|if|then|fi|for|do|done|sudo)\b/gm,

    cpp:
      /(\/\/.*$)|("[^"\n]*")|\b(int|void|bool|char|class|struct|return|if|else|for|while|include|namespace|std|const|auto|true|false)\b|\b(\d+)\b/gm,

    sql:
      /(--.*$)|('[^'\n]*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|AND|OR|JOIN|ON|ORDER|BY|GROUP)\b|\b(\d+)\b/gim,
  }

  const re = patterns[lang]

  if (!re) return [code]

  const nodes: ReactNode[] = []
  let last = 0
  let i = 0

  for (const match of code.matchAll(re)) {
    const start = match.index ?? 0

    if (start > last) {
      nodes.push(code.slice(last, start))
    }

    const text = match[0]

    const kind = match[1]
      ? 'tok-cmt'
      : match[2]
        ? 'tok-str'
        : match[3]
          ? 'tok-kw'
          : 'tok-num'

    nodes.push(
      <span key={i++} className={kind}>
        {text}
      </span>,
    )

    last = start + text.length
  }

  if (last < code.length) {
    nodes.push(code.slice(last))
  }

  return nodes
}

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

            const lang =
              /language-([\w#+]+)/.exec(className || '')?.[1]?.toLowerCase() || ''

            const fenced =
              Boolean(className) || text.includes('\n')

            if (!fenced) {
              return (
                <code className="inline-code" {...props}>
                  {text}
                </code>
              )
            }

            const diagram =
              DIAGRAM.test(text) || lang === 'text'

            return (
              <code
                className={
                  diagram
                    ? 'ascii-diagram'
                    : `lang-${lang || 'plain'}`
                }
                {...props}
              >
                {diagram
                  ? text
                  : highlight(
                      text,
                      lang === 'sh' || lang === 'shell'
                        ? 'bash'
                        : lang,
                    )}
              </code>
            )
          },

          pre({ children: body }) {
            const only =
              Array.isArray(body)
                ? body[0]
                : body

            const diagram =
              only &&
              typeof only === 'object' &&
              'props' in only &&
              String(
                (
                  only as {
                    props?: {
                      className?: string
                    }
                  }
                ).props?.className || '',
              ).includes('ascii-diagram')

            return (
              <pre
                className={
                  diagram
                    ? 'code-block ascii-diagram-wrap'
                    : 'code-block'
                }
              >
                {body}
              </pre>
            )
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}