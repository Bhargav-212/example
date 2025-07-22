import React from 'react'
import { WalletProvider } from './contexts/WalletContext'
import { ToastProvider } from './components/ui/Toast'
import DashboardLayout from './components/layout/DashboardLayout'
import Overview from './pages/Overview'
import Upload from './pages/Upload'
import Access from './pages/Access'
import Activity from './pages/Activity'
import Chat from './pages/Chat'

const App = () => {
  const renderPage = (currentPage) => {
    switch (currentPage) {
      case 'overview':
        return <Overview />
      case 'upload':
        return <Upload />
      case 'access':
        return <Access />
      case 'activity':
        return <Activity />
      case 'chat':
        return <Chat />
      default:
        return <Overview />
    }
  }

  return (
    <ToastProvider>
      <WalletProvider>
        <DashboardLayout>
          {renderPage()}
        </DashboardLayout>
      </WalletProvider>
    </ToastProvider>
  )
}

export default App
