import { useSearch } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Button from '~app/components/Button'
import FeatureList from '~app/components/Premium/FeatureList'
import PriceSection from '~app/components/Premium/PriceSection'
import { usePremium } from '~app/hooks/use-premium'
import { trackEvent } from '~app/plausible'
import { premiumRoute } from '~app/router'
import { licenseKeyAtom } from '~app/state'
import { deactivateLicenseKey } from '~services/premium'

function PremiumPage() {
  const { t } = useTranslation()
  const [licenseKey, setLicenseKey] = useAtom(licenseKeyAtom)
  const premiumState = usePremium()
  const [deactivating, setDeactivating] = useState(false)
  const { source } = useSearch({ from: premiumRoute.id })

  const activateLicense = useCallback(() => {
    const key = window.prompt('Enter your license key', '')
    if (key) {
      setLicenseKey(key)
    }
  }, [setLicenseKey])

  const deactivateLicense = useCallback(async () => {
    if (!licenseKey) {
      return
    }
    if (!window.confirm('Are you sure to deactivate this device?')) {
      return
    }
    setDeactivating(true)
    await deactivateLicenseKey(licenseKey)
    setLicenseKey('')
    setTimeout(() => location.reload(), 500)
  }, [licenseKey, setLicenseKey])

  return (
    <div className="flex flex-col bg-primary-background dark:text-primary-text rounded-[20px] h-full p-[50px] overflow-y-auto">
      <h1 className="font-bold text-[40px] leading-none text-primary-text">{t('Premium')}</h1>
      {!premiumState.activated && (
        <p className="bg-[#FAE387] text-[#303030] w-fit rounded-[5px] px-2 py-[4px] text-sm font-semibold mt-9">
          {t('Earlybird price')}
        </p>
      )}
      {!premiumState.activated && (
        <div className="mt-5">
          <PriceSection />
        </div>
      )}
      <div className="mt-8">
        <FeatureList textSize="normal" />
      </div>
      <div className="flex flex-row items-center gap-3 mt-10">
        {premiumState.activated ? (
          <>
            <Button text={t('🎉 License activated')} color="primary" className="w-fit !py-2" />
            <Button
              text={t('Deactivate')}
              className="w-fit !py-2"
              onClick={deactivateLicense}
              isLoading={deactivating}
            />
          </>
        ) : (
          <>
            <a
              href={`https://chathub.gg/api/premium/redirect?source=${source || ''}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('click_buy_premium')}
            >
              <Button text={t('Get premium license')} color="primary" className="w-fit !py-2 rounded-lg" />
            </a>
            <Button
              text={t('Activate license')}
              color="flat"
              className="w-fit !py-2 rounded-lg"
              onClick={activateLicense}
              isLoading={premiumState.isLoading}
            />
          </>
        )}
        <a
          href="https://app.lemonsqueezy.com/my-orders/"
          target="_blank"
          rel="noreferrer"
          className="underline ml-2 text-sm text-secondary-text font-medium w-fit"
        >
          {t('Manage order and devices')}
        </a>
      </div>
      {!!premiumState.error && <span className="mt-3 text-red-500 font-medium">{premiumState.error}</span>}
      <Toaster position="top-right" />
    </div>
  )
}

export default PremiumPage
