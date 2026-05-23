import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MobileSidebar } from './MobileSidebar'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { defaultNavigationItem, navigationItems } from './navigation'

export function ProtectedLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const location = useLocation()

  const currentPage = useMemo(
    () => navigationItems.find((item) => location.pathname === item.href) ?? defaultNavigationItem,
    [location.pathname],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar />
      </div>

      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="min-h-screen lg:pl-72">
        <Topbar
          description={currentPage.description}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          title={currentPage.label}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
