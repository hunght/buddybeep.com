import PromptLibrary from './Library'
import Dialog from '../Dialog'
import { InsertPropmtType } from '~app/types/InsertPropmtType'

interface Props {
  isOpen: boolean
  onClose: () => void
  insertPrompt: InsertPropmtType
}

const PromptLibraryDialog = (props: Props) => {
  return (
    <Dialog title="Prompt Library" open={props.isOpen} onClose={props.onClose} className="mx-32 w-full min-h-[400px]">
      <div className="p-5 overflow-auto">
        <PromptLibrary insertPrompt={props.insertPrompt} />
      </div>
    </Dialog>
  )
}

export default PromptLibraryDialog
