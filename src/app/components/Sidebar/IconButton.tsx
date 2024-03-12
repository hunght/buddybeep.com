import { cx } from '~utils'

export function IconButton(props: { icon: string; onClick?: () => void; className?: string }) {
  return (
    <div
      className={cx(
        'p-[6px] rounded-[10px] w-fit cursor-pointer hover:opacity-80 bg-secondary bg-opacity-20',
        props.className,
      )}
      onClick={props.onClick}
    >
      <img src={props.icon} className="w-6 h-6" />
    </div>
  )
}
