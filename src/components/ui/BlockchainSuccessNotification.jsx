import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'

const BlockchainSuccessNotification = () => {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if setup was completed
    const isCompleted = localStorage.getItem('securex_blockchain_setup_completed') === 'true'
    const wasDismissed = localStorage.getItem('securex_blockchain_success_dismissed') === 'true'
    
    if (isCompleted && !wasDismissed && !dismissed) {
      // Show notification after a short delay
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [dismissed])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('securex_blockchain_success_dismissed', 'true')
  }

  const handleTryNow = () => {
    // You could add navigation logic here or emit an event
    handleDismiss()
    // For now, just scroll to top to show connect wallet button
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <GlassCard className="p-4 border border-green-500/30 bg-green-500/10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-green-400 font-medium text-sm mb-1">
                  🎉 Blockchain Ready!
                </h4>
                <p className="text-gray-300 text-xs mb-3">
                  Your smart contract is deployed. Ready to upload documents to the blockchain?
                </p>
                
                <div className="flex space-x-2">
                  <NeonButton
                    size="sm"
                    onClick={handleTryNow}
                    className="text-xs px-3 py-1"
                  >
                    <ArrowRightIcon className="w-3 h-3 mr-1" />
                    Try Now
                  </NeonButton>
                  
                  <button
                    onClick={handleDismiss}
                    className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 rounded transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BlockchainSuccessNotification
