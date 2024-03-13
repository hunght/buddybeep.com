import { Dialog as HeadlessDialog, Transition } from '@headlessui/react'
import { t } from 'i18next'
import { FC, Fragment, PropsWithChildren } from 'react'
import closeIcon from '~/assets/icons/close.svg'
import { cx } from '~/utils'
import { LanguageSelection } from '~app/pages/LanguageSelection'

interface Props {
  title?: string
  open: boolean
  onClose: () => void
  className?: string
  borderless?: boolean
}

const Dialog: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <Transition.Root show={props.open} as={Fragment}>
      <HeadlessDialog as="div" onClose={props.onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center max-h-screen bg-secondary-text bg-opacity-90">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <HeadlessDialog.Panel
              className={cx(
                'mx-auto rounded-2xl bg-primary-background shadow-2xl max-h-full overflow-hidden flex flex-col',
                props.className,
              )}
            >
              {props.title ? (
                <HeadlessDialog.Title
                  className={cx(
                    !props.borderless && 'border-b',
                    'border-solid border-primary-border flex flex-row justify-center items-center py-3 px-5',
                  )}
                >
                  <span className="ml-auto" />
                  <span className="font-bold text-primary-text text-base">{props.title}</span>
                  <div className=" ml-auto mr-[10px] flex flex-row items-center gap-2">
                    <p className="font-bold text-sm text-center">{t('Language')}</p>
                    <div className="w-40">
                      <LanguageSelection />
                    </div>

                    <img src={closeIcon} className="w-4 h-4 cursor-pointer ml-4" onClick={props.onClose} />
                  </div>
                </HeadlessDialog.Title>
              ) : (
                <HeadlessDialog.Title></HeadlessDialog.Title>
              )}

              {props.children}
            </HeadlessDialog.Panel>
          </Transition.Child>
        </div>
      </HeadlessDialog>
    </Transition.Root>
  )
}

export default Dialog
