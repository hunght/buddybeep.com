import { cx } from '~/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { BeatLoader } from 'react-spinners'
import React from 'react'
import { motion } from 'framer-motion'

export interface Props {
  text: string
  className?: string
  color?: 'primary' | 'flat'
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  onClick?: () => void
  isLoading?: boolean
  size?: 'small' | 'normal' | 'tiny'
  icon?: ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const size = props.size || 'normal'
  const type = props.type || 'button'
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        size === 'normal' && 'text-base font-medium px-6 py-[5px] rounded-full',
        size === 'small' && 'text-sm px-4 py-1 rounded-xl',
        size === 'tiny' && 'text-xs px-3 py-[3px] rounded-lg',
        props.color === 'primary' ? 'text-white bg-primary-blue' : 'text-primary-text bg-secondary',
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.isLoading ? (
        <BeatLoader size={size === 'normal' ? 10 : 5} color={props.color === 'primary' ? 'white' : '#303030'} />
      ) : (
        <div className="flex flex-row items-center gap-1 min-w-max">
          {props.icon}
          <span>{props.text}</span>
        </div>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button

export const MotionButton = motion(Button)
