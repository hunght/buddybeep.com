import React, { useEffect } from 'react'

interface SuccessPopupProps {
  noteId: string
  onClose: () => void
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ noteId, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 10000)
    return () => clearTimeout(timer)
  }, [onClose])

  const handleClick = () => {
    window.open(`https://www.buddybeep.com/dashboard/${noteId}`, '_blank')
  }

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#872DD3',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999,
        cursor: 'pointer',
      }}
    >
      Note created successfully! Click to view.1
    </div>
  )
}

export default SuccessPopup
