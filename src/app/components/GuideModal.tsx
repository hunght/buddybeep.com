import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { incrAppOpenTimes } from '~services/storage/open-times'
import Button from './Button'
import Dialog from './Dialog'

const GuideModal: FC = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [openTimes, setOpenTimes] = useState(0)
  const [isEdge, setIsEdge] = useState(false)
  const [isChrome, setIsChrome] = useState(false)
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isEdge = /Edg/.test(navigator.userAgent)
      const isChrome = /Chrome/.test(navigator.userAgent)
      setIsEdge(isEdge)
      setIsChrome(isChrome)
    }
  }, [])
  useEffect(() => {
    incrAppOpenTimes().then((t) => {
      if (t === 15) {
        setOpen(true)
      }
      setOpenTimes(t)
    })
  }, [])

  if (openTimes === 15) {
    const getUrl = isEdge
      ? 'https://microsoftedge.microsoft.com/addons/detail/okjbfkonbgmfhcekhdpbodcfadofdefg'
      : 'https://chromewebstore.google.com/detail/bubbybeep-your-ai-explora/cbibgdcbkoikdkeahemkjkpacmgicaco'
    return (
      <Dialog title="🌟🌟🌟🌟🌟" open={open} onClose={() => setOpen(false)} className="rounded-2xl w-[600px]">
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="font-semibold text-primary-text">{t('Enjoy BuddyBeep? Give us a 5-star rating!')}</p>
          <a href={getUrl} target="_blank" rel="noreferrer">
            <Button text={t('Write review')} />
          </a>
        </div>
      </Dialog>
    )
  }

  return null
}

export default GuideModal
