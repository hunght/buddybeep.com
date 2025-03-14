import { Link } from '@tanstack/react-router'
import { cx } from '~/utils'
import { useAtom } from 'jotai'
import { ComponentPropsWithoutRef, FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ColorResult, TwitterPicker } from 'react-color'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'
import { usePremium } from '~app/hooks/use-premium'
import { trackEvent } from '~app/plausible'
import { followArcThemeAtom, themeColorAtom } from '~app/state'
import { applyThemeMode } from '~app/utils/color-scheme'
import { isArcBrowser } from '~app/utils/env'

import { ThemeMode, getUserThemeMode, setUserThemeMode } from '~services/theme'

import Dialog from '../Dialog'
import Select from '../Select'

const Button: FC<ComponentPropsWithoutRef<'button'>> = (props) => {
  const { className, ...extraProps } = props
  return (
    <button
      type="button"
      className={cx(
        'relative inline-flex items-center bg-primary-background px-3 py-2 text-sm font-semibold text-primary-text ring-1 ring-inset ring-gray-300 hover:opacity-80 focus:z-10',
        className,
      )}
      {...extraProps}
    />
  )
}

const THEME_COLORS = [
  '#e7e7e7',
  '#FF6900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#0693E3',
  '#ABB8C3',
  '#EB144C',
  '#F78DA7',
  '#555555',
]

interface Props {}

const ThemeSettingModal: FC<Props> = (props) => {
  const { t, i18n } = useTranslation()
  const [themeColor, setThemeColor] = useAtom(themeColorAtom)
  const [themeMode, setThemeMode] = useState(getUserThemeMode())
  const premiumState = usePremium()
  const [followArcTheme, setFollowArcTheme] = useAtom(followArcThemeAtom)
  const [zoomLevel, setZoomLevel] = useState<number | null>(null)

  useEffect(() => {
    Browser.tabs.getZoom().then((zoom) => setZoomLevel(zoom))
  }, [])

  const updateZoomLevel = useCallback(
    (op: '+' | '-') => {
      if (!zoomLevel) {
        return
      }
      const newZoom = op === '+' ? zoomLevel + 0.1 : zoomLevel - 0.1
      if (newZoom < 0.7 || newZoom > 1.2) {
        return
      }
      Browser.tabs.setZoom(newZoom)
      setZoomLevel(newZoom)
      trackEvent('change_zoom_level', { zoom: newZoom })
    },
    [zoomLevel],
  )

  const onThemeModeChange = useCallback((mode: ThemeMode) => {
    setUserThemeMode(mode)
    setThemeMode(mode)
    applyThemeMode(mode)
    trackEvent('change_theme_mode', { mode })
  }, [])

  const onThemeColorChange = useCallback(
    (color: ColorResult) => {
      setThemeColor(color.hex)
      trackEvent('change_theme_color', { color: color.hex })
    },
    [setThemeColor],
  )

  return (
    <>
      <div className="pb-10 flex flex-col gap-5">
        <div className="w-[300px]">
          <p className="font-bold text-lg mb-3">{t('Theme Mode')}</p>
          <Select
            options={[
              { name: t('Auto'), value: ThemeMode.Auto },
              { name: t('Light'), value: ThemeMode.Light },
              { name: t('Dark'), value: ThemeMode.Dark },
            ]}
            value={themeMode}
            onChange={onThemeModeChange}
          />
        </div>
      </div>
    </>
  )
}

export default ThemeSettingModal
