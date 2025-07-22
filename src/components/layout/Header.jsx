import React from 'react'
import { motion } from 'framer-motion'
import { BellIcon, UserCircleIcon, WalletIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import GlassCard from '../ui/GlassCard'
import NeonButton from '../ui/NeonButton'
import { useWallet } from '../../contexts/WalletContext'

const Header = ({ currentPage }) => {
  const { isConnected, address, connectWallet, disconnectWallet, loading, error, chainId, switchNetwork } = useWallet()
  
  const pageNames = {
    overview: 'Dashboard Overview',
    upload: 'Upload Documents',
    access: 'Access Files',
    activity: 'Activity Logs',
    chat: 'AI Assistant'
  }
  
  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkName = (id) => {
    switch (Number(id)) {
      case 1: return 'Ethereum'
      case 137: return 'Polygon'
      case 80001: return 'Mumbai'
      default: return `Chain ${id?.toString()}`
    }
  }

  const isCorrectNetwork = chainId === 80001n

  return (
    <header className="sticky top-0 z-30 p-4 lg:p-6">
      <GlassCard className="flex items-center justify-between p-4">
        <div>
          <motion.h1 
            key={currentPage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            {pageNames[currentPage]}
          </motion.h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back to your secure document dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </motion.div>
          )}

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <BellIcon className="w-6 h-6" />
          </motion.button>
          
          {/* Wallet Connection */}
          {isConnected ? (
            <div className="flex items-center space-x-3">
              <GlassCard className="px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{formatAddress(address)}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">{getNetworkName(chainId)}</span>
                      {!isCorrectNetwork && (
                        <button
                          onClick={() => switchNetwork(80001)}
                          className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                          disabled={loading}
                        >
                          Switch to Mumbai
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={disconnectWallet}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Disconnect Wallet"
              >
                <UserCircleIcon className="w-6 h-6" />
              </motion.button>
            </div>
          ) : (
            <NeonButton 
              onClick={connectWallet}
              loading={loading}
              disabled={loading}
              size="sm"
              className="flex items-center space-x-2"
            >
              <WalletIcon className="w-4 h-4" />
              <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </header>
  )
}

export default Header
