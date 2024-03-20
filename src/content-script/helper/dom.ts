import { Readability } from '@mozilla/readability'

export function getDocumentTextFromDOM(): string {
  const clone = document.documentElement.cloneNode(true)

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
  return [document.body.innerText, ...Array.from(document.querySelectorAll('svg text')).map((e) => e.innerHTML)].join(
    ' ',
  )
}
