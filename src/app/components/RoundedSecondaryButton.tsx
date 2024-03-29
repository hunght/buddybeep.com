import React from 'react'
import { cx } from '~utils'

export const RoundedSecondaryButton: React.FunctionComponent<{
  disabled?: boolean
  title: string
  onClick: () => void
}> = ({ title, disabled, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50',
        disabled && 'cursor-not-allowed bg-secondary text-secondary-text',
      )}
      disabled={disabled}
    >
      {title}
    </button>
  )
}
