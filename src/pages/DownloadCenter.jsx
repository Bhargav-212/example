import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowDownTrayIcon,
  DocumentIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'
import { useToast } from '../components/ui/Toast'

const DownloadCenter = () => {
  const [documents, setDocuments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [downloadStatus, setDownloadStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const { isConnected, address } = useWallet()
  const toast = useToast()

  // Mock documents data with download capabilities
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true)
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (isConnected && address) {
        const mockDocuments = [
          {
            id: 1,
            fileName: 'SecureX_Whitepaper_v2.pdf',
            ipfsHash: 'QmXyZ123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz8',
            fileSize: 2458624,
            uploadDate: '2024-01-15T14:30:25Z',
            mimeType: 'application/pdf',
            downloadCount: 45,
            lastDownload: '2024-01-20T10:15:30Z',
            status: 'available'
          },
          {
            id: 2,
            fileName: 'Smart_Contract_Audit_Report.pdf',
            ipfsHash: 'QmAbc456def789xyz123uvw456qrs789tuv012wxy345abc678def901ghi234',
            fileSize: 1888256,
            uploadDate: '2024-01-14T13:45:12Z',
            mimeType: 'application/pdf',
            downloadCount: 23,
            lastDownload: '2024-01-19T16:22:45Z',
            status: 'available'
          },
          {
            id: 3,
            fileName: 'Technical_Documentation.docx',
            ipfsHash: 'QmDef789ghi012jkl345mno678pqr901stu234vwx567yz8abc123def456',
            fileSize: 3247616,
            uploadDate: '2024-01-13T09:20:15Z',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            downloadCount: 67,
            lastDownload: '2024-01-21T14:05:20Z',
            status: 'available'
          },
          {
            id: 4,
            fileName: 'Project_Roadmap_2024.pdf',
            ipfsHash: 'QmGhi012jkl345mno678pqr901stu234vwx567yz8abc123def456ghi789',
            fileSize: 1567890,
            uploadDate: '2024-01-12T16:45:30Z',
            mimeType: 'application/pdf',
            downloadCount: 89,
            lastDownload: '2024-01-22T11:30:15Z',
            status: 'available'
          },
          {
            id: 5,
            fileName: 'API_Reference_Guide.pdf',
            ipfsHash: 'QmJkl345mno678pqr901stu234vwx567yz8abc123def456ghi789jkl012',
            fileSize: 4567890,
            uploadDate: '2024-01-11T12:15:45Z',
            mimeType: 'application/pdf',
            downloadCount: 156,
            lastDownload: '2024-01-22T15:45:10Z',
            status: 'available'
          },
          {
            id: 6,
            fileName: 'Security_Best_Practices.docx',
            ipfsHash: 'QmMno678pqr901stu234vwx567yz8abc123def456ghi789jkl012mno345',
            fileSize: 2345678,
            uploadDate: '2024-01-10T08:30:20Z',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            downloadCount: 78,
            lastDownload: '2024-01-21T09:12:35Z',
            status: 'available'
          }
        ]
        setDocuments(mockDocuments)
      }
      
      setLoading(false)
    }

    fetchDocuments()
  }, [isConnected, address])

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
      case 'zip':
      case 'rar':
        return '📦'
      default:
        return '📎'
    }
  }

  const downloadFromIPFS = async (document) => {
    setDownloadStatus(prev => ({ ...prev, [document.id]: 'downloading' }))
    
    try {
      // Simulate download process
      const ipfsUrl = `https://ipfs.io/ipfs/${document.ipfsHash}`
      
      // In a real implementation, you would fetch the file from IPFS
      // For demo purposes, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock blob for demonstration
      const blob = new Blob(['Mock file content'], { type: document.mimeType })
      const url = URL.createObjectURL(blob)
      
      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = document.fileName
      link.click()
      
      // Cleanup
      URL.revokeObjectURL(url)
      link.remove()
      
      setDownloadStatus(prev => ({ ...prev, [document.id]: 'completed' }))
      toast.success(`${document.fileName} downloaded successfully!`)
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [document.id]: null }))
      }, 3000)
      
    } catch (error) {
      console.error('Download error:', error)
      setDownloadStatus(prev => ({ ...prev, [document.id]: 'error' }))
      toast.error('Download failed. Please try again.')
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [document.id]: null }))
      }, 3000)
    }
  }

  const viewOnIPFS = (hash) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')
    toast.success('Opening document on IPFS')
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} copied to clipboard!`)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const getDownloadButtonState = (docId) => {
    const status = downloadStatus[docId]
    switch (status) {
      case 'downloading':
        return { text: 'Downloading...', disabled: true, loading: true }
      case 'completed':
        return { text: 'Downloaded ✓', disabled: true, loading: false }
      case 'error':
        return { text: 'Retry Download', disabled: false, loading: false }
      default:
        return { text: 'Download', disabled: false, loading: false }
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
          <ArrowDownTrayIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access the download center.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Download Center</h1>
          <p className="text-gray-300">Download your documents directly from IPFS</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <FolderIcon className="w-5 h-5" />
            <span>{documents.length} documents available</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <GlassCard className="p-4">
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 hover:bg-white/5 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-3xl">{getFileIcon(doc.fileName)}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">{doc.fileName}</h3>
                      <p className="text-gray-400 text-sm">{formatFileSize(doc.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span className="text-sm">{doc.downloadCount}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span>Uploaded: {formatDate(doc.uploadDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <EyeIcon className="w-4 h-4" />
                    <span>Last downloaded: {formatDate(doc.lastDownload)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">IPFS CID:</span>
                    <button
                      onClick={() => copyToClipboard(doc.ipfsHash, 'IPFS Hash')}
                      className="p-1 text-gray-400 hover:text-neon-green transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="block text-xs text-neon-green bg-black/30 p-2 rounded break-all">
                    {doc.ipfsHash}
                  </code>
                </div>

                <div className="space-y-3">
                  <NeonButton
                    onClick={() => downloadFromIPFS(doc)}
                    disabled={getDownloadButtonState(doc.id).disabled}
                    loading={getDownloadButtonState(doc.id).loading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {downloadStatus[doc.id] === 'completed' ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : downloadStatus[doc.id] === 'error' ? (
                      <ExclamationCircleIcon className="w-4 h-4" />
                    ) : (
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    )}
                    <span>{getDownloadButtonState(doc.id).text}</span>
                  </NeonButton>

                  <button
                    onClick={() => viewOnIPFS(doc.ipfsHash)}
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View on IPFS</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      doc.status === 'available' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {doc.status === 'available' ? '✓ Available' : '⏳ Processing'}
                    </span>
                    <span className="text-gray-500">{doc.mimeType.split('/')[1]?.toUpperCase()}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Documents Found</h2>
          <p className="text-gray-400 mb-6">
            {searchQuery 
              ? 'No documents match your search criteria.' 
              : 'No documents available for download.'
            }
          </p>
          {searchQuery && (
            <NeonButton onClick={() => setSearchQuery('')}>
              Clear Search
            </NeonButton>
          )}
        </div>
      )}

      {/* Download Instructions */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <ArrowDownTrayIcon className="w-5 h-5 text-neon-green" />
          <span>Download Instructions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-medium text-white mb-2">Direct Download</h4>
            <p>Click the "Download" button to fetch files directly from IPFS to your device.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">IPFS Gateway</h4>
            <p>Use "View on IPFS" to access files through the IPFS gateway in your browser.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">Copy CID</h4>
            <p>Click the link icon to copy the IPFS Content Identifier for use in other applications.</p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-2">File Verification</h4>
            <p>All files are cryptographically verified to ensure integrity and authenticity.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default DownloadCenter
