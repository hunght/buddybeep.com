import React from 'react'
import { cx } from '~utils'

export const PrimaryButton: React.FunctionComponent<{ disabled?: boolean; title: string; onClick: () => void }> = ({
  title,
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-md bg-indigo-600 py-2 text-lg font-semibold text-primary-text shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 px-4',
        disabled && 'cursor-not-allowed bg-secondary text-secondary-text',
      )}
      disabled={disabled}
    >
      {title}
    </button>
  )
}
