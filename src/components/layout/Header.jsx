import React from 'react'
import { motion } from 'framer-motion'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import GlassCard from '../ui/GlassCard'
import NeonButton from '../ui/NeonButton'
import { useWallet } from '../../contexts/WalletContext'

const Header = ({ currentPage }) => {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()
  
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
              <GlassCard className="px-4 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">{formatAddress(address)}</span>
              </GlassCard>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={disconnectWallet}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <UserCircleIcon className="w-6 h-6" />
              </motion.button>
            </div>
          ) : (
            <NeonButton onClick={connectWallet} size="sm">
              Connect Wallet
            </NeonButton>
          )}
        </div>
      </GlassCard>
    </header>
  )
}

export default Header
