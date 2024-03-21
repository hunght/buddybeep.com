import { FC } from 'react'
import { RadioGroup } from '@headlessui/react'

import { OptionType } from './type'
import { cx } from '~utils'

type Props = {
  options: OptionType[]
  value: OptionType
  onChange: (value: OptionType) => void
}

export const RadioGroupView: FC<Props> = ({ options, value, onChange }) => {
  return (
    <RadioGroup value={value} onChange={onChange} className="mt-2">
      <RadioGroup.Label className="sr-only">Choose a memory option</RadioGroup.Label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {options.map((option) => (
          <RadioGroup.Option
            key={option.name}
            value={option}
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
