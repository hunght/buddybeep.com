import { RadioGroup } from '@headlessui/react'

import { OptionType } from './type'
import { cx } from '~utils'

interface Props<T> {
  options: OptionType[]
  value: T
  onChange: (value: T) => void
  label?: string
}

export const RadioGroupView = <T,>({ options, value, onChange, label }: Props<T>) => {
  return (
    <RadioGroup value={value} onChange={onChange} className="mt-2">
      {label && <RadioGroup.Label className="sr-only">{label}</RadioGroup.Label>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.name}
            value={option.value}
            className={({ active, checked }) =>
              cx(
                'cursor-pointer focus:outline-none',
                active ? 'ring-2 ring-indigo-600 ring-offset-2' : '',
                checked
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
                'flex items-center justify-center rounded-xl py-3 px-3 text-sm font-semibold   sm:flex-1',
              )
            }
          >
            <RadioGroup.Label as="span">{option.name}</RadioGroup.Label>
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
