import { Readability } from '@mozilla/readability'
import { isEmpty } from 'lodash-es'
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
export function getDocumentDescription() {
  // Get all meta elements from the document
  const metaElements = document.getElementsByTagName('meta')

  // Iterate over the array of meta elements
  for (let i = 0; i < metaElements.length; i++) {
    // Check if the name attribute of the meta tag is 'description'
    if (metaElements[i].getAttribute('name') === 'description') {
      // Return the content of the description meta tag
      return metaElements[i].getAttribute('content')
    }
  }

  // Return a default message or null if no description meta tag is found
  return null
}
export function getStyledHtml(element: HTMLElement | null): string {
  const htmlContent = element?.innerHTML || ''

  const turndownService = new TurndownService()
  turndownService.addRule('absoluteLinks', {
    filter: 'a',
    replacement: function (content: string, node: any) {
      const href = node.getAttribute('href')
      if (!href || isEmpty(content.trim())) {
        return ''
      }
      console.log(`==== content ===`)
      console.log(content)
      console.log('==== end log ===')

      // Check if the link is relative and not an absolute URL
      if (href && !href.includes('://')) {
        const baseURL = `${window.location.protocol}//${window.location.host}`
        return `[${content}](${baseURL}${href.startsWith('/') ? '' : '/'}${href})`
      }
      return `[${content}](${href})`
    },
  })
  const markdown = turndownService.turndown(htmlContent)

  return markdown
}
