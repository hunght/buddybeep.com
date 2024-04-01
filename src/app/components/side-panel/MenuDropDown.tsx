import React, { FC } from 'react'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { IoMdRemoveCircleOutline } from 'react-icons/io'
import { t } from 'i18next'
import { LanguageSelection } from '~app/pages/LanguageSelection'
import { BiExpand } from 'react-icons/bi'

const MenuDropDown: FC<{ onExpand: () => void; clearHistory: () => void }> = ({ onExpand, clearHistory }) => {
  return (
    <Menu as="div" className="relative ml-3 text-primary-text ">
      <div>
        <Menu.Button className="relative flex max-w-xs items-center text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ">
          <span className="absolute -inset-1.5" />
          <span className="sr-only">Open user menu</span>
          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-secondary px-2 py-3 gap-1">
          <Menu.Item>
            <LanguageSelection />
          </Menu.Item>
          <Menu.Item>
            <div
              className="flex flex-row hover:bg-primary-blue   cursor-pointer items-center gap-1 rounded  py-2"
              onClick={() => {
                onExpand()
              }}
            >
              <BiExpand size={24} className="  bg-secondary p-1 rounded-[10px] w-fit  hover:opacity-80" />
              <span>{t('Expand')}</span>
            </div>
          </Menu.Item>
          <Menu.Item>
            <div
              onClick={clearHistory}
              className="flex flex-row hover:bg-primary-blue cursor-pointer items-center gap-1 rounded py-2"
            >
              <IoMdRemoveCircleOutline className=" bg-secondary p-1 rounded text-2xl" />
              <span>{t('Clear history')}</span>
            </div>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default MenuDropDown
