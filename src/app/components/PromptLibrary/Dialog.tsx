import PromptLibrary from './Library'
import Dialog from '../Dialog'
import { InsertPropmtType } from '~app/types/InsertPropmtType'
import { t } from 'i18next'

interface Props {
  isOpen: boolean
  onClose: () => void
  insertPrompt: InsertPropmtType
}

const PromptLibraryDialog = (props: Props) => {
  return (
    <Dialog
      title={t('Prompt Library')}
      open={props.isOpen}
      onClose={props.onClose}
      className="mx-32 w-full min-h-[400px]"
      showLanguageSelection={true}
    >
      <div className="p-5 overflow-auto">
        <PromptLibrary insertPrompt={props.insertPrompt} />
      </div>
    </Dialog>
  )
}

export default PromptLibraryDialog
