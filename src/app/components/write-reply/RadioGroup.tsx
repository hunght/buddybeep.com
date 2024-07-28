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
                'flex items-center justify-center rounded-full py-2 px-0 text-sm font-semibold text-center sm:flex-1',
                active ? 'ring-2 ring-indigo-600 ring-offset-2' : '',
                checked
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50',
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
