import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircleIcon,
  XMarkIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import GlassCard from './GlassCard'

const OptimizationComplete = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show notification after a short delay
    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem('optimization_notification_shown')
      const now = Date.now()
      
      // Show if never shown or if it's been more than 24 hours
      if (!lastShown || (now - parseInt(lastShown)) > 24 * 60 * 60 * 1000) {
        setShow(true)
        localStorage.setItem('optimization_notification_shown', now.toString())
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <GlassCard className="p-4 border border-green-500/30 bg-green-500/10">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <RocketLaunchIcon className="w-5 h-5 text-green-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-green-400 font-medium text-sm mb-1">
                  ⚡ Performance Optimized!
                </h4>
                <div className="text-gray-300 text-xs space-y-1">
                  <p>✅ Recent Documents: No more flickering</p>
                  <p>✅ Added 2 demo smart contract docs</p>
                  <p>✅ AI Chat: Enhanced for smart contracts</p>
                </div>
                
                <div className="mt-3 text-xs text-blue-400">
                  Try asking the AI about smart contract functions!
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

export default OptimizationComplete
