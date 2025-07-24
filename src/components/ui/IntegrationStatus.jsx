import React from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import GlassCard from './GlassCard'
import { useWallet } from '../../contexts/WalletContext'
import NeonButton from './NeonButton'
import { getContractConfig } from '../../config/contract'
import { isValidAddress } from '../../utils/addressUtils'
import { freeStorageService } from '../../services/freeStorageService'

const IntegrationStatus = () => {
  const { isConnected, address, chainId, contractInitialized, demoMode, setDemoMode } = useWallet()

  // Get storage statistics for Free Edition
  const storageStats = freeStorageService.getStorageStats()
  const storageAvailable = freeStorageService.isStorageAvailable()

  const getFreeStorageStatus = () => {
    if (!storageAvailable) {
      return { status: 'error', message: 'Storage unavailable' }
    }

    const usagePercent = (storageStats.documentsUsed / storageStats.documentsLimit) * 100

    if (usagePercent >= 90) {
      return { status: 'warning', message: `${storageStats.documentsRemaining} slots left` }
    }

    return { status: 'success', message: `${storageStats.documentsUsed}/${storageStats.documentsLimit} used` }
  }

  const getBrowserStatus = () => {
    const hasLocalStorage = typeof(Storage) !== "undefined"
    const hasFileAPI = window.File && window.FileReader && window.FileList && window.Blob

    if (hasLocalStorage && hasFileAPI) {
      return { status: 'success', message: 'Fully compatible' }
    }

    return { status: 'warning', message: 'Limited features' }
  }
  
  const storageStatus = getFreeStorageStatus()
  const browserStatus = getBrowserStatus()
  
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
    }
  }
  
  const StatusBadge = ({ status, children }) => {
    const colors = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      disconnected: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    
    return (
      <span className={`px-2 py-1 text-xs rounded border ${colors[status] || colors.disconnected}`}>
        {children}
      </span>
    )
  }
  
  return (
    <GlassCard className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white mb-0">SecureX Free Edition</h3>
        </div>
        <div className="flex items-center space-x-1">
          <StatusIcon status={storageAvailable ? 'success' : 'warning'} />
          <span className="text-sm text-gray-300">
            {storageAvailable ? 'Ready' : 'Setup Required'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local Storage Status */}
        <div className="flex items-center space-x-3">
          <StatusIcon status={storageStatus.status} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Storage</p>
            <StatusBadge status={storageStatus.status}>
              {storageStatus.message}
            </StatusBadge>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="flex items-center space-x-3">
          <StatusIcon status={browserStatus.status} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Browser</p>
            <StatusBadge status={browserStatus.status}>
              {browserStatus.message}
            </StatusBadge>
          </div>
        </div>

        {/* Free Edition Features */}
        <div className="flex items-center space-x-3">
          <StatusIcon status="success" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Features</p>
            <StatusBadge status="success">
              No Setup Required
            </StatusBadge>
          </div>
        </div>
      </div>
      
      {/* Free Edition Information */}
      <div className="mt-4 space-y-3">
        {/* Storage Usage */}
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-green-400 font-medium mb-1">✨ Free Edition Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                <div>
                  <p className="font-medium text-white">Storage Limits:</p>
                  <ul className="space-y-1">
                    <li>• Up to {storageStats.documentsLimit} documents</li>
                    <li>• 10MB max file size</li>
                    <li>• Local browser storage</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-white">Current Usage:</p>
                  <ul className="space-y-1">
                    <li>• {storageStats.documentsUsed} documents stored</li>
                    <li>• {storageStats.documentsRemaining} slots remaining</li>
                    <li>• {(storageStats.totalSizeUsed / 1024 / 1024).toFixed(2)}MB used</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Setup Required */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <StarIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-blue-400 font-medium mb-1">🚀 Ready to Use</h4>
              <p className="text-sm text-gray-300">
                No blockchain setup, no IPFS costs, no backend required. Start uploading documents immediately!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Display */}
      {isConnected && address && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Connected Address:</span>
            <code className="text-neon-green bg-black/30 px-2 py-1 rounded">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
          </div>
        </div>
      )}
    </GlassCard>
  )
}

export default IntegrationStatus
