export function showSuccessPopup(noteId: string) {
  const popup = document.createElement('div')
  popup.innerText = 'Note created successfully! Click to view.'
  popup.style.position = 'fixed'
  popup.style.top = '20px'
  popup.style.right = '20px'
  popup.style.backgroundColor = '#872DD3'
  popup.style.color = 'white'
  popup.style.padding = '10px'
  popup.style.borderRadius = '5px'
  popup.style.zIndex = '9999'
  popup.style.cursor = 'pointer'
  popup.onclick = () => {
    window.open(`https://www.buddybeep.com/dashboard/${noteId}`, '_blank')
  }

  document.body.appendChild(popup)

  setTimeout(() => {
    document.body.removeChild(popup)
  }, 10000)
}
