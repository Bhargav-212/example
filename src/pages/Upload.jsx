import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'
import { useToast } from '../components/ui/Toast'

const Upload = () => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadHistory, setUploadHistory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  
  const { isConnected, address, signer } = useWallet()
  const toast = useToast()

  // Mock upload history - in production, fetch from backend
  useEffect(() => {
    if (isConnected && address) {
      setUploadHistory([
        {
          id: 1,
          name: 'Project_Whitepaper.pdf',
          ipfsHash: 'QmXyZ123abc456def789ghi012jkl345mno678pqr',
          transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
          uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: 2458624,
          status: 'completed'
        },
        {
          id: 2,
          name: 'Smart_Contract_Audit.pdf',
          ipfsHash: 'QmAbc456def789xyz123uvw456qrs789tuv012wxy',
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          fileSize: 1888256,
          status: 'completed'
        }
      ])
    }
  }, [isConnected, address])

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
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        file,
        id: Date.now() + Math.random(),
        preview: null,
        status: 'ready'
      }))
      setFiles(prev => [...prev, ...newFiles])
      generatePreviews(newFiles)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        id: Date.now() + Math.random(),
        preview: null,
        status: 'ready'
      }))
      setFiles(prev => [...prev, ...newFiles])
      generatePreviews(newFiles)
    }
    e.target.value = '' // Reset input
  }

  const generatePreviews = (fileList) => {
    fileList.forEach(fileObj => {
      const { file } = fileObj
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFiles(prev => prev.map(f => 
            f.id === fileObj.id ? { ...f, preview: e.target.result } : f
          ))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const uploadToIPFS = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)

    try {
      for (const fileObj of files) {
        if (fileObj.status !== 'ready') continue

        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'uploading' } : f
        ))

        // Simulate IPFS upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: progress }))
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        // Simulate IPFS upload and blockchain transaction
        const ipfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        const txHash = `0x${Math.random().toString(16).substring(2, 66)}`

        // Update file status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { 
            ...f, 
            status: 'completed',
            ipfsHash,
            transactionHash: txHash
          } : f
        ))

        // Add to upload history
        const newUpload = {
          id: Date.now() + Math.random(),
          name: fileObj.file.name,
          ipfsHash,
          transactionHash: txHash,
          uploadDate: new Date().toISOString(),
          fileSize: fileObj.file.size,
          status: 'completed'
        }
        
        setUploadHistory(prev => [newUpload, ...prev])
        
        toast.success(`${fileObj.file.name} uploaded successfully!`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'txt':
        return '📃'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      default:
        return '📎'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const filteredHistory = uploadHistory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Upload Documents</h1>
        <p className="text-gray-300">Securely store your documents on IPFS with blockchain verification</p>
      </div>

      {/* Upload Area */}
      <div className="max-w-6xl mx-auto">
        <GlassCard className="p-8">
          <div
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center
              transition-all duration-300
              ${dragActive 
                ? 'border-neon-green bg-neon-green/10 scale-105' 
                : 'border-gray-500 hover:border-gray-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
            />
            
            <motion.div
              animate={{ 
                y: dragActive ? -10 : 0,
                scale: dragActive ? 1.05 : 1
              }}
              className="space-y-4"
            >
              <motion.div
                animate={{ rotate: dragActive ? 10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <CloudArrowUpIcon className="w-16 h-16 text-gray-400 mx-auto" />
              </motion.div>
              <div>
                <p className="text-xl font-semibold text-white mb-2">
                  Drop your files here, or <span className="text-neon-green cursor-pointer">browse</span>
                </p>
                <p className="text-gray-400">
                  Support for PDF, DOC, TXT, and images • Max 10MB per file
                </p>
              </div>
            </motion.div>
          </div>

          {/* File Previews */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Selected Files ({files.length})</h3>
                  <div className="flex space-x-2">
                    <NeonButton 
                      onClick={() => setFiles([])}
                      variant="outline"
                      size="sm"
                    >
                      Clear All
                    </NeonButton>
                    <NeonButton 
                      onClick={uploadToIPFS}
                      loading={uploading}
                      disabled={!isConnected || files.some(f => f.status === 'uploading')}
                    >
                      {uploading ? 'Uploading...' : 'Upload to IPFS'}
                    </NeonButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {files.map((fileObj) => (
                    <motion.div
                      key={fileObj.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`
                        relative p-4 rounded-xl border transition-all duration-300
                        ${fileObj.status === 'completed' 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : fileObj.status === 'uploading'
                          ? 'bg-neon-green/10 border-neon-green/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-4">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {fileObj.preview ? (
                            <img 
                              src={fileObj.preview} 
                              alt="Preview" 
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-green/20 to-blue-500/20 flex items-center justify-center text-2xl">
                              {getFileIcon(fileObj.file.name)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">{fileObj.file.name}</p>
                            <div className="flex items-center space-x-2">
                              {fileObj.status === 'completed' && (
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                              )}
                              {fileObj.status === 'ready' && (
                                <button
                                  onClick={() => removeFile(fileObj.id)}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm">{formatFileSize(fileObj.file.size)}</p>
                          
                          {/* Progress Bar */}
                          {fileObj.status === 'uploading' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Uploading to IPFS...</span>
                                <span>{uploadProgress[fileObj.id] || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                  className="h-2 bg-neon-green rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress[fileObj.id] || 0}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Upload Results */}
                          {fileObj.status === 'completed' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">IPFS:</span>
                                <code className="text-xs text-neon-green bg-black/30 px-2 py-1 rounded">
                                  {fileObj.ipfsHash?.slice(0, 20)}...
                                </code>
                                <button
                                  onClick={() => copyToClipboard(fileObj.ipfsHash, 'IPFS Hash')}
                                  className="p-1 text-gray-400 hover:text-neon-green transition-colors"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-400">TX:</span>
                                <code className="text-xs text-blue-400 bg-black/30 px-2 py-1 rounded">
                                  {fileObj.transactionHash?.slice(0, 20)}...
                                </code>
                                <button
                                  onClick={() => copyToClipboard(fileObj.transactionHash, 'Transaction Hash')}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Upload History */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="mt-8">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Upload History</h2>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">File</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">IPFS Hash</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Transaction</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredHistory.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-white/5 transition-all duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getFileIcon(item.name)}</span>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-xs text-green-400">✓ Verified</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <code className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded">
                              {item.ipfsHash.slice(0, 15)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(item.ipfsHash, 'IPFS Hash')}
                              className="p-1 text-gray-400 hover:text-neon-green transition-colors"
                            >
                              <LinkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <code className="text-blue-400 text-sm bg-gray-800 px-2 py-1 rounded">
                              {item.transactionHash.slice(0, 10)}...
                            </code>
                            <button
                              onClick={() => copyToClipboard(item.transactionHash, 'Transaction Hash')}
                              className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            >
                              <LinkIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {formatDate(item.uploadDate)}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {formatFileSize(item.fileSize)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                              title="View on IPFS"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                              title="Download"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredHistory.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchQuery ? 'No files match your search.' : 'No uploads yet. Start by uploading your first document!'}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Upload
