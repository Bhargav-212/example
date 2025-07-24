import React, { useState } from 'react'
import { WalletProvider } from './contexts/WalletContext'
import { ToastProvider } from './components/ui/Toast'
import DashboardLayout from './components/layout/DashboardLayout'
import Overview from './pages/Overview'
import Upload from './pages/Upload'
import RecentDocuments from './pages/RecentDocuments'
import DownloadCenter from './pages/DownloadCenter'
import AIDocumentChat from './pages/AIDocumentChat'
import AccessControl from './pages/AccessControl'
import MetaMaskHelper from './components/ui/MetaMaskHelper'

const App = () => {
  const [currentPage, setCurrentPage] = useState('overview')

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />
      case 'upload':
        return <Upload />
      case 'recent':
        return <RecentDocuments />
      case 'download':
        return <DownloadCenter />
      case 'chat':
        return <AIDocumentChat />
      case 'control':
        return <AccessControl />
      default:
        return <Overview />
    }
  }

  return (
    <ToastProvider>
      <WalletProvider>
        <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
          {renderPage()}
        </DashboardLayout>
        <MetaMaskHelper />
      </WalletProvider>
    </ToastProvider>
  )
}

export default App
