import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { FeatureId } from '~app/components/Premium/FeatureList'

import { getDefaultThemeColor } from '~app/utils/color-scheme'

import { Campaign } from '~services/server-api'

export const licenseKeyAtom = atomWithStorage('licenseKey', '', undefined, { getOnInit: true })
export const sidebarCollapsedAtom = atomWithStorage('sidebarCollapsed', false, undefined, { getOnInit: true })
export const themeColorAtom = atomWithStorage('themeColor', getDefaultThemeColor())
export const followArcThemeAtom = atomWithStorage('followArcTheme', false)

export const showDiscountModalAtom = atom<false | true | Campaign>(false)
export const showPremiumModalAtom = atom<false | true | FeatureId>(false)
export const releaseNotesAtom = atom<string[]>([])
