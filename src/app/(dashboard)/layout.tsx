'use client'
import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
        className="sidebar-offset"
      >
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main
          style={{
            flex: 1,
            padding: '20px',
            maxWidth: '1200px',
            width: '100%',
          }}
          className="mx-auto w-full"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
