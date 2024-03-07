import PromptLibrary from './Library'
import Dialog from '../Dialog'
import { BotId } from '~app/bots'

interface Props {
  isOpen: boolean
  onClose: () => void
  insertPrompt: ({ botId, agentId }: { botId: BotId; agentId: string | null }) => void
}

const PromptLibraryDialog = (props: Props) => {
  return (
    <Dialog title="Prompt Library" open={props.isOpen} onClose={props.onClose} className="w-[1200px] min-h-[400px]">
      <div className="p-5 overflow-auto">
        <PromptLibrary insertPrompt={props.insertPrompt} />
      </div>
    </Dialog>
  )
}

export default PromptLibraryDialog
