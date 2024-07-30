import React from 'react'
import { createRoot } from 'react-dom/client'
import SuccessPopup from '~/app/components/SuccessPopup'
import { createPortal } from 'react-dom'
export function showSuccessPopup(noteId: string) {
  const containerElement = document.createElement('div')
  document.body.appendChild(containerElement)

  const root = createRoot(containerElement)

  const removePopup = () => {
    root.unmount()
    document.body.removeChild(containerElement)
  }

  root.render(
    <React.StrictMode>
      {createPortal(<SuccessPopup noteId={noteId} onClose={removePopup} />, document.body)}
    </React.StrictMode>,
  )
}
