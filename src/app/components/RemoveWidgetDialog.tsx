import React, { useEffect, useState, useRef } from 'react'

interface RemoveWidgetDialogProps {
  onClose: () => void
  onRemoveOneTime: () => void
  onRemovePermanently: () => void
}

const RemoveWidgetDialog: React.FC<RemoveWidgetDialogProps> = ({ onClose, onRemoveOneTime, onRemovePermanently }) => {
  const [isOpen, setIsOpen] = useState(true)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false)
      onClose()
    }, 10000)

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleRemoveOneTime = () => {
    onRemoveOneTime()
    setIsOpen(false)
    onClose()
  }

  const handleRemovePermanently = () => {
    onRemovePermanently()
    setIsOpen(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-black opacity-30" />
        <div ref={dialogRef} className="relative bg-white rounded-lg p-6 max-w-sm mx-auto">
          <h2 className="text-lg font-medium text-gray-900">Remove Widget</h2>
          <p className="mt-2 text-sm text-gray-500">How would you like to remove this widget?</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={handleRemoveOneTime}
              className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Remove One Time
            </button>
            <button
              onClick={handleRemovePermanently}
              className="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            >
              Remove Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RemoveWidgetDialog
