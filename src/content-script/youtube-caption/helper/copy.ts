export function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  } else {
    navigator.clipboard.writeText(text).then(
      function () {},
      function (err) {},
    )
  }

  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea')
    textArea.value = text

    // Avoid scrolling to bottom
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      const msg = successful ? 'successful' : 'unsuccessful'
    } catch (err) {}

    document.body.removeChild(textArea)
  }
}
