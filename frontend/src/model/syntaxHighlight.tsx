import type { ReactNode } from 'react'

const DIAGRAM = /[┌┐└┘├┤│─►◄═]/

const PATTERNS: Record<string, RegExp> = {
  python:
    /(#.*$)|("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')|\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|in|not|and|or|True|False|None|lambda|yield|pass|break|continue|async|await)\b|\b(\d+)\b/gm,
  bash:
    /(#.*$)|("[^"\n]*"|'[^'\n]*')|\b(git|cd|ls|echo|export|if|then|fi|for|do|done|sudo|bash|sh|chmod|grep|find|cat|pwd)\b/gm,
  cpp:
    /(\/\/.*$)|("[^"\n]*")|\b(int|void|bool|char|class|struct|return|if|else|for|while|include|namespace|std|const|auto|true|false|using|template|typename|public|private|virtual|override)\b|\b(\d+)\b/gm,
  c:
    /(\/\/.*$)|("[^"\n]*")|\b(int|void|char|return|if|else|for|while|include|const|struct|typedef|sizeof)\b|\b(\d+)\b/gm,
  javascript:
    /(\/\/.*$)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|import|from|export|class|async|await|new|true|false|null|undefined)\b|\b(\d+)\b/gm,
  typescript:
    /(\/\/.*$)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|\b(const|let|var|function|return|if|else|for|while|import|from|export|class|async|await|new|true|false|null|undefined|type|interface|string|number|boolean)\b|\b(\d+)\b/gm,
  sql:
    /(--.*$)|('[^'\n]*')|\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|NOT|NULL|AND|OR|JOIN|ON|ORDER|BY|GROUP|AS|LIMIT)\b|\b(\d+)\b/gim,
  json:
    /("[^"\n]*")|:|\b(true|false|null)\b|\b(-?\d+(?:\.\d+)?)\b/g,
  html:
    /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][^>]*>)|("[^"]*")/g,
  css:
    /(\/\*[\s\S]*?\*\/)|([.#]?[a-zA-Z][\w-]*(?=\s*\{))|(:[a-zA-Z-]+)|("[^"]*")/g,
}

export function normalizeLang(lang: string | undefined | null): string {
  const raw = (lang || '').toLowerCase().replace(/^\./, '')
  if (!raw || raw === 'text' || raw === 'plain' || raw === 'plaintext') return 'text'
  if (raw === 'sh' || raw === 'shell' || raw === 'zsh' || raw === 'console' || raw === 'terminal') return 'bash'
  if (raw === 'c++' || raw === 'cxx' || raw === 'cc' || raw === 'hpp') return 'cpp'
  if (raw === 'js' || raw === 'jsx' || raw === 'node') return 'javascript'
  if (raw === 'ts' || raw === 'tsx') return 'typescript'
  if (raw === 'py') return 'python'
  if (raw === 'htm' || raw === 'xml') return 'html'
  if (raw === 'jsonc') return 'json'
  return raw
}

export function isDiagramCode(code: string, lang?: string) {
  return DIAGRAM.test(code) || normalizeLang(lang) === 'text' && DIAGRAM.test(code)
}

export function highlightCode(code: string, lang?: string): ReactNode[] {
  const resolved = normalizeLang(lang)
  if (!resolved || resolved === 'text' || DIAGRAM.test(code)) return [code]
  const re = PATTERNS[resolved]
  if (!re) return [code]
  const nodes: ReactNode[] = []
  let last = 0
  let i = 0
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`
  const pattern = new RegExp(re.source, flags)
  for (const match of code.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) nodes.push(code.slice(last, start))
    const text = match[0]
    let kind = 'tok-plain'
    if (resolved === 'html') {
      kind = match[1] ? 'tok-cmt' : match[2] ? 'tok-kw' : 'tok-str'
    } else if (resolved === 'css') {
      kind = match[1] ? 'tok-cmt' : match[2] ? 'tok-kw' : match[3] ? 'tok-num' : 'tok-str'
    } else if (resolved === 'json') {
      kind = match[1] ? 'tok-str' : match[2] ? 'tok-plain' : match[3] ? 'tok-kw' : 'tok-num'
    } else {
      kind = match[1] ? 'tok-cmt' : match[2] ? 'tok-str' : match[3] ? 'tok-kw' : 'tok-num'
    }
    nodes.push(
      <span key={i++} className={kind}>
        {text}
      </span>,
    )
    last = start + text.length
  }
  if (last < code.length) nodes.push(code.slice(last))
  return nodes
}
