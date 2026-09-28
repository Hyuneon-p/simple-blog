import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, breaks: true })

export function sanitizeBody(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 's', 'del', 'u', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'a'],
    allowedAttributes: {
      p: ['style'], h1: ['style'], h2: ['style'], h3: ['style'],
      h4: ['style'], h5: ['style'], h6: ['style'],
      a: ['href', 'title'], ol: ['start'], code: ['class'],
    },
    allowedClasses: { code: ['language-*'] },
    allowedStyles: { '*': { 'text-align': [/^(left|center|right|justify)$/] } },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  })
}

export function renderBody(body: string, format: 'markdown' | 'html') {
  return sanitizeBody(format === 'html' ? body : markdown.render(body))
}
