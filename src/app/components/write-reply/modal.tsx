import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Dialog from '../Dialog'
import { WriteReplyUI } from './WriteReplyUI'

export const WritingPresetModal: FC<{ open: boolean; onClose: () => void; onGenerate: (prompt: string) => void }> = ({
  open,
  onClose,
  onGenerate,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog title={t('Generate Draft')} open={open} onClose={onClose} className="w-full mx-1 ">
      <WriteReplyUI onGenerate={onGenerate} />
    </Dialog>
  )
}
