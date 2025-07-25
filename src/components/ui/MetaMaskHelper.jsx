import React from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'
import { useWallet } from '../../contexts/WalletContext'

const MetaMaskHelper = () => {
  const { error, loading, clearPendingRequest } = useWallet()

  // Only show if there's a pending connection error
  if (!error || !error.includes('pending')) {
    return null
  }

  const handleRefreshPage = () => {
    window.location.reload()
  }

  const handleClearAndRetry = () => {
    clearPendingRequest()
    // Small delay to ensure state is cleared before retrying
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const troubleshootingSteps = [
    {
      step: "Check MetaMask popup",
      description: "Look for any open MetaMask windows or notifications",
      action: "Approve or reject any pending requests"
    },
    {
      step: "Close MetaMask popups",
      description: "Close all MetaMask browser windows/tabs",
      action: "Then try connecting again"
    },
    {
      step: "Refresh the page",
      description: "This will clear any pending connection requests",
      action: "Click the refresh button below"
    },
    {
      step: "Restart browser",
      description: "If the issue persists, restart your browser",
      action: "Close all browser windows and reopen"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full"
      >
        <GlassCard className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">MetaMask Connection Pending</h3>
            <p className="text-gray-400 text-sm">
              There's already a connection request waiting in MetaMask
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="text-white font-medium mb-3">Quick Fixes:</h4>
            
            {troubleshootingSteps.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-6 h-6 bg-neon-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neon-green text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{item.step}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                  <p className="text-neon-green text-xs mt-1">{item.action}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <NeonButton
              onClick={handleClearAndRetry}
              className="w-full"
              disabled={loading}
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Clear & Refresh Page
            </NeonButton>
            
            <button
              onClick={clearPendingRequest}
              className="w-full p-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Just clear the error (don't refresh)
            </button>
          </div>

          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-300">
                <p className="font-medium">Pro Tip:</p>
                <p>Always check for MetaMask notification popups in your browser's address bar or system notifications.</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

export default MetaMaskHelper
