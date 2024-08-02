import { useState, useEffect } from 'react'
import { showSuccessPopup } from '~utils/successPopup'

export function useSuccessPopup() {
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (showSuccess) {
      showSuccessPopup(showSuccess)
    }
  }, [showSuccess])

  return { showSuccess, setShowSuccess }
}
