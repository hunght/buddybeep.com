import { createRoot } from 'react-dom/client'
import RemoveWidgetDialog from '~/app/components/RemoveWidgetDialog'

export function removeWidgetDialog(onRemoveOneTime: () => void, onRemovePermanently: () => void) {
  const containerElement = document.createElement('div')
  document.body.appendChild(containerElement)

  const root = createRoot(containerElement)

  const removePopup = () => {
    root.unmount()
    document.body.removeChild(containerElement)
  }

  root.render(
    <RemoveWidgetDialog
      onClose={removePopup}
      onRemoveOneTime={onRemoveOneTime}
      onRemovePermanently={onRemovePermanently}
    />,
  )
}
