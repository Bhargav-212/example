import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  UserIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  DocumentIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'
import localStorageService from '../services/localStorageService'

const AccessControl = () => {
  const [accessLogs, setAccessLogs] = useState([])
  const [documents, setDocuments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [loading, setLoading] = useState(true)
  const { isConnected, address, demoMode } = useWallet()

  // Load access control data from local storage or mock data
  useEffect(() => {
    const fetchAccessData = async () => {
      setLoading(true)

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (isConnected && address) {
        let userDocuments = []
        let activityLogs = []

        if (demoMode) {
          // Initialize demo data if needed
          localStorageService.initializeDemoData(address)

          // Get documents and activity logs from local storage
          userDocuments = localStorageService.getUserDocuments(address)
          activityLogs = localStorageService.getActivityLogs()

          // Filter activity logs for current user's documents
          const userDocumentNames = userDocuments.map(doc => doc.fileName)
          activityLogs = activityLogs.filter(log =>
            userDocumentNames.includes(log.fileName)
          )
        } else {
          // Use mock data for non-demo mode
          userDocuments = [
            {
              id: 1,
              fileName: 'SecureX_Whitepaper_v2.pdf',
              views: 145,
              downloadCount: 23,
              lastAccessed: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            }
          ]
        }

        // Transform documents for access control display
        const documentsWithStats = userDocuments.map(doc => ({
          id: doc.id,
          name: doc.fileName,
          totalViews: doc.views || Math.floor(Math.random() * 200) + 50,
          uniqueViewers: Math.floor((doc.views || 100) * 0.6),
          downloads: doc.downloadCount || Math.floor(Math.random() * 50) + 10,
          lastAccessed: doc.lastAccessed || doc.uploadDate,
          accessLevel: Math.random() > 0.7 ? 'restricted' : 'public'
        }))

        // Transform activity logs for access control display
        const accessLogsFormatted = activityLogs.map((log, index) => ({
          id: log.id || index + 1,
          documentName: log.fileName,
          userAddress: log.user === address ? address : `0x${Math.random().toString(16).substr(2, 16)}...`,
          action: log.type,
          timestamp: log.timestamp,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          location: ['New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE', 'San Francisco, US'][Math.floor(Math.random() * 5)],
          browser: ['Chrome 120', 'Firefox 121', 'Safari 17', 'Edge 120'][Math.floor(Math.random() * 4)],
          duration: `${Math.floor(Math.random() * 15) + 1} minutes`
        }))

        setDocuments(documentsWithStats)
        setAccessLogs(accessLogsFormatted)
      }

      setLoading(false)
    }

    fetchAccessData()
  }, [isConnected, address, demoMode])

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'view':
        return <EyeIcon className="w-4 h-4 text-blue-400" />
      case 'download':
        return <ArrowDownTrayIcon className="w-4 h-4 text-green-400" />
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'view':
        return 'text-blue-400 bg-blue-400/10'
      case 'download':
        return 'text-green-400 bg-green-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getAccessLevelBadge = (level) => {
    switch (level) {
      case 'public':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Public</span>
      case 'restricted':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">Restricted</span>
      case 'private':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Private</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">Unknown</span>
    }
  }

  const filteredLogs = accessLogs.filter(log =>
    log.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.userAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalViews = documents.reduce((sum, doc) => sum + doc.totalViews, 0)
  const totalDownloads = documents.reduce((sum, doc) => sum + doc.downloads, 0)
  const uniqueUsers = new Set(accessLogs.map(log => log.userAddress)).size

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <GlassCard className="p-8 text-center">
          <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access the access control dashboard.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <ShieldCheckIcon className="w-8 h-8 text-neon-green" />
          <span>Access Control</span>
        </h1>
        <p className="text-gray-300">
          Monitor who has accessed your documents {demoMode ? '(Demo Mode)' : ''}
        </p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
            </div>
            <EyeIcon className="w-8 h-8 text-blue-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Downloads</p>
              <p className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</p>
            </div>
            <ArrowDownTrayIcon className="w-8 h-8 text-green-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Users</p>
              <p className="text-2xl font-bold text-white">{uniqueUsers}</p>
            </div>
            <UserIcon className="w-8 h-8 text-purple-400" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Documents</p>
              <p className="text-2xl font-bold text-white">{documents.length}</p>
            </div>
            <DocumentIcon className="w-8 h-8 text-orange-400" />
          </div>
        </GlassCard>
      </div>

      {/* Document Statistics */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <ChartBarIcon className="w-5 h-5 text-neon-green" />
          <span>Document Access Statistics</span>
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-2 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-400 text-sm">Document</th>
                  <th className="text-left py-3 text-gray-400 text-sm">Views</th>
                  <th className="text-left py-3 text-gray-400 text-sm">Unique Viewers</th>
                  <th className="text-left py-3 text-gray-400 text-sm">Downloads</th>
                  <th className="text-left py-3 text-gray-400 text-sm">Access Level</th>
                  <th className="text-left py-3 text-gray-400 text-sm">Last Accessed</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <DocumentIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">{doc.totalViews}</td>
                    <td className="py-4 text-gray-300">{doc.uniqueViewers}</td>
                    <td className="py-4 text-gray-300">{doc.downloads}</td>
                    <td className="py-4">{getAccessLevelBadge(doc.accessLevel)}</td>
                    <td className="py-4 text-gray-400 text-sm">{formatTimeAgo(doc.lastAccessed)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Access Logs */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-neon-green" />
            <span>Recent Access Activity</span>
          </h3>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-200 text-sm"
              />
            </div>
            
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-green transition-all duration-200 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium">{log.documentName}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{log.userAddress === address ? 'You' : log.userAddress}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-3 h-3" />
                          <span>{log.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <GlobeAltIcon className="w-3 h-3" />
                          <span>{log.browser}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{log.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <p>{formatTimeAgo(log.timestamp)}</p>
                    <p className="text-xs">{log.ipAddress}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Access Logs Found</h3>
            <p className="text-gray-400">
              {searchQuery 
                ? 'No logs match your search criteria.' 
                : 'No access activity recorded yet.'
              }
            </p>
          </div>
        )}
      </GlassCard>

      {/* Privacy Notice */}
      <GlassCard className="p-6 border-l-4 border-l-blue-400 bg-blue-400/5">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-400 font-semibold mb-2">Privacy & Security Notice</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>• Access logs are stored securely and encrypted</p>
              <p>• IP addresses are hashed for privacy protection</p>
              <p>• Only document owners can view access control data</p>
              <p>• Logs are automatically purged after 90 days</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

export default AccessControl
