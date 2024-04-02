import { CatchBoundary, Outlet } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { themeColorAtom } from '~app/state'

import Sidebar from './Sidebar'

function Layout() {
  const themeColor = useAtomValue(themeColorAtom)

  return (
    <main className="h-screen grid grid-cols-[auto_1fr] bg-[#e7e7e7] dark:bg-primary-background">
      <Sidebar />
      <div className="px-[15px] py-3 h-full overflow-hidden">
        <Outlet />
      </div>
      {/* <DiscountModal />
      <PremiumModal />
      <ReleaseNotesModal /> */}
    </main>
  )
}

export default Layout
