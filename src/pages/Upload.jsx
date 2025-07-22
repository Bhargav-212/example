import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'

const Upload = () => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const { isConnected } = useWallet()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(Array.from(e.target.files))
    }
  }

  const uploadToIPFS = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }
    
    setUploading(true)
    // TODO: Implement IPFS upload logic
    setTimeout(() => {
      setUploading(false)
      alert('Upload functionality coming soon!')
    }, 2000)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Upload Documents</h1>
        <p className="text-gray-300">Securely store your documents on IPFS with blockchain verification</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <GlassCard className="p-8">
          <div
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center
              transition-all duration-300
              ${dragActive 
                ? 'border-neon-green bg-neon-green/10' 
                : 'border-gray-500 hover:border-gray-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <motion.div
              animate={{ y: dragActive ? -10 : 0 }}
              className="space-y-4"
            >
              <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Drop your files here, or <span className="text-neon-green">browse</span>
                </p>
                <p className="text-gray-400">
                  Support for PDF, DOC, TXT, and more
                </p>
              </div>
            </motion.div>
          </div>

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">Selected Files</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                  <DocumentIcon className="w-8 h-8 text-neon-green" />
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-4">
                <NeonButton 
                  onClick={uploadToIPFS}
                  loading={uploading}
                  disabled={!isConnected}
                >
                  {uploading ? 'Uploading...' : 'Upload to IPFS'}
                </NeonButton>
              </div>
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default Upload
