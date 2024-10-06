import { cx } from '~utils'

export const ActionButton = (props: { text: string; onClick: () => void; className?: string }) => {
  return (
    <a
      className={cx(
        'inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer',
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.text}
    </a>
  )
}
