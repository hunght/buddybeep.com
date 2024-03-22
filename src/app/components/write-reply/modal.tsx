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
    <Dialog title={t('Preset Writing Assistant')} open={open} onClose={onClose} className="w-full  ">
      <WriteReplyUI onGenerate={onGenerate} />
    </Dialog>
  )
}
