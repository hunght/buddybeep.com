import { Readability } from '@mozilla/readability'
import TurndownService from 'turndown'
export function getDocumentTextFromDOM(fromElement: HTMLElement | null): string {
  if (!fromElement) {
    return ''
  }
  const clone = fromElement.cloneNode(true)

  // Create a new document
  const newDoc = document.implementation.createHTMLDocument('title')

  // Replace the newly created document's html with the clone
  newDoc.replaceChild(clone, newDoc.documentElement)
  const doc = new Readability(newDoc)
  const article = doc.parse()

  if (article) {
    const articleContent = article.textContent

    return articleContent
  }
  return [fromElement.innerText, ...Array.from(document.querySelectorAll('svg text')).map((e) => e.innerHTML)].join(' ')
}

export function getStyledHtml(element: HTMLElement | null): string {
  const htmlContent = element?.innerHTML || ''

  const turndownService = new TurndownService()
  const markdown = turndownService.turndown(htmlContent)

  return markdown
}
