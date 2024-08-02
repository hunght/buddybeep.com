import { Readability } from '@mozilla/readability'
import { isEmpty } from 'lodash-es'
import TurndownService from 'turndown'

export function getDocumentTextFromDOM(fromElement: HTMLElement | null): string {
  if (!fromElement) {
    return ''
  }
  const clone = fromElement.cloneNode(true)

  // Create a new document and append cloned content
  const newDoc = document.implementation.createHTMLDocument('title')
  newDoc.body.innerHTML = clone.outerHTML // Changed to use outerHTML

  const readability = new Readability(newDoc)
  const article = readability.parse()

  if (article) {
    return getStyledHtml(article.content)
  }

  return getStyledHtml(fromElement.outerHTML)
}

function getStyledHtml(htmlContent: string): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
  })
  turndownService.addRule('absoluteLinks', {
    filter: 'a',
    replacement: function (content: string, node: any) {
      const href = node.getAttribute('href')
      if (!href || isEmpty(content.trim())) {
        return ''
      }
      if (href && !href.includes('://')) {
        const baseURL = `${window.location.protocol}//${window.location.host}`
        return `[${content}](${baseURL}${href.startsWith('/') ? '' : '/'}${href})`
      }
      return `[${content}](${href})`
    },
  })
  return turndownService.turndown(htmlContent)
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
