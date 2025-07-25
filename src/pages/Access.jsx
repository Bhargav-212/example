import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DocumentIcon, EyeIcon, ArrowDownTrayIcon, ShareIcon, LinkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'
import { useToast } from '../components/ui/Toast'
import localStorageService from '../services/localStorageService'

const Access = () => {
  const [documents, setDocuments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { isConnected, address, demoMode } = useWallet()
  const toast = useToast()

  // Load documents from local storage
  useEffect(() => {
    const loadDocuments = () => {
      if (isConnected && address && demoMode) {
        // Initialize demo data if needed
        localStorageService.initializeDemoData(address)
        // Get user documents from local storage
        const userDocs = localStorageService.getUserDocuments(address)
        setDocuments(userDocs)
      } else {
        setDocuments([])
      }
      setLoading(false)
    }

    loadDocuments()
  }, [isConnected, address, demoMode])

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
      day: 'numeric'
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

  const openIPFS = (hash, documentId) => {
    // Increment view count
    if (documentId) {
      localStorageService.incrementViews(documentId)
      // Update local state to reflect the change
      setDocuments(prev => prev.map(doc =>
        doc.id === documentId
          ? { ...doc, views: (doc.views || 0) + 1, lastAccessed: new Date().toISOString() }
          : doc
      ))
    }

    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')
    toast.success('Opening document on IPFS')
  }

  const shareDocument = (document) => {
    const shareUrl = `https://ipfs.io/ipfs/${document.ipfsHash}`
    if (navigator.share) {
      navigator.share({
        title: document.fileName,
        text: `Check out this document: ${document.fileName}`,
        url: shareUrl
      })
    } else {
      copyToClipboard(shareUrl, 'Share link')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.ipfsHash.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <GlassCard className="p-8 text-center">
          <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access your documents.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Access Documents</h1>
        <p className="text-gray-300">Manage and access your uploaded documents</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search */}
        <GlassCard className="p-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents or IPFS hashes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-200"
            />
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Your Documents</h2>
              <div className="text-sm text-gray-400">
                {filteredDocuments.length} of {documents.length} documents
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Document</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">IPFS Hash</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Upload Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-700 rounded w-32"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-12"></div></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-700 rounded"></div>
                          <div className="w-8 h-8 bg-gray-700 rounded"></div>
                          <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredDocuments.map((doc, index) => (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-white/5 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="w-6 h-6 text-neon-green" />
                          <div>
                            <p className="text-white font-medium">{doc.fileName}</p>
                            <p className="text-xs text-green-400">✓ Verified</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <code className="text-gray-400 text-sm bg-gray-800 px-2 py-1 rounded">
                            {doc.ipfsHash.slice(0, 15)}...
                          </code>
                          <button
                            onClick={() => copyToClipboard(doc.ipfsHash, 'IPFS Hash')}
                            className="p-1 text-gray-400 hover:text-neon-green transition-colors"
                            title="Copy IPFS hash"
                          >
                            <LinkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatDate(doc.uploadDate)}</td>
                      <td className="px-6 py-4 text-gray-300">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-6 py-4 text-gray-300">{doc.views || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openIPFS(doc.ipfsHash, doc.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            title="View on IPFS"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              localStorageService.incrementDownloads(doc.id)
                              openIPFS(doc.ipfsHash, doc.id)
                            }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            title="Download"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => shareDocument(doc)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                            title="Share"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Documents Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? 'No documents match your search criteria.'
                  : demoMode
                    ? 'Upload some documents to see them here.'
                    : 'Connect to a contract and upload documents to access them here.'
                }
              </p>
              {searchQuery && (
                <NeonButton onClick={() => setSearchQuery('')}>
                  Clear Search
                </NeonButton>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default Access
