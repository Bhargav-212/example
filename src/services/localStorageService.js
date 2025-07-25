/**
 * Local Storage Service for SecureX Documents
 * Manages document data persistence across all pages in demo mode
 */

const STORAGE_KEYS = {
  DOCUMENTS: 'securex_documents',
  ACTIVITY_LOGS: 'securex_activity_logs',
  SETTINGS: 'securex_settings'
}

class LocalStorageService {
  /**
   * Get all documents from local storage
   * @returns {Array} Array of document objects
   */
  getDocuments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading documents from localStorage:', error)
      return []
    }
  }

  /**
   * Save a new document to local storage
   * @param {Object} document - Document object to save
   */
  saveDocument(document) {
    try {
      const documents = this.getDocuments()
      const newDocument = {
        id: document.id || Date.now() + Math.random(),
        fileName: document.fileName,
        ipfsHash: document.ipfsHash,
        transactionHash: document.transactionHash || `0x${Math.random().toString(16).substr(2, 64)}`,
        uploadDate: document.uploadDate || new Date().toISOString(),
        fileSize: document.fileSize,
        uploader: document.uploader,
        mimeType: this.getMimeType(document.fileName),
        status: 'completed',
        views: 0,
        downloadCount: 0,
        lastAccessed: new Date().toISOString(),
        lastDownload: null,
        // Additional metadata
        blockNumber: Math.floor(Math.random() * 1000000) + 4890000,
        gasUsed: (Math.floor(Math.random() * 50000) + 100000).toString(),
        documentId: document.documentId || Math.floor(Math.random() * 1000) + 1
      }

      // Add to beginning of array (most recent first)
      documents.unshift(newDocument)
      
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
      
      // Also create activity log entry
      this.addActivityLog({
        type: 'upload',
        action: 'Document Uploaded',
        fileName: newDocument.fileName,
        ipfsHash: newDocument.ipfsHash,
        user: newDocument.uploader,
        timestamp: newDocument.uploadDate,
        blockNumber: newDocument.blockNumber,
        transactionHash: newDocument.transactionHash,
        gasUsed: newDocument.gasUsed,
        status: 'confirmed'
      })

      return newDocument
    } catch (error) {
      console.error('Error saving document to localStorage:', error)
      throw error
    }
  }

  /**
   * Update document properties
   * @param {string|number} documentId - Document ID to update
   * @param {Object} updates - Properties to update
   */
  updateDocument(documentId, updates) {
    try {
      const documents = this.getDocuments()
      const index = documents.findIndex(doc => doc.id === documentId)
      
      if (index !== -1) {
        documents[index] = { ...documents[index], ...updates }
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
        return documents[index]
      }
      
      return null
    } catch (error) {
      console.error('Error updating document in localStorage:', error)
      throw error
    }
  }

  /**
   * Increment document view count
   * @param {string|number} documentId - Document ID
   */
  incrementViews(documentId) {
    const document = this.updateDocument(documentId, {
      views: this.getDocuments().find(doc => doc.id === documentId)?.views + 1 || 1,
      lastAccessed: new Date().toISOString()
    })

    if (document) {
      // Add view activity log
      this.addActivityLog({
        type: 'view',
        action: 'Document Accessed',
        fileName: document.fileName,
        ipfsHash: document.ipfsHash,
        user: document.uploader, // In real app, this would be current user
        timestamp: new Date().toISOString(),
        blockNumber: document.blockNumber + Math.floor(Math.random() * 10),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: (Math.floor(Math.random() * 10000) + 15000).toString(),
        status: 'confirmed'
      })
    }

    return document
  }

  /**
   * Increment document download count
   * @param {string|number} documentId - Document ID
   */
  incrementDownloads(documentId) {
    const document = this.updateDocument(documentId, {
      downloadCount: this.getDocuments().find(doc => doc.id === documentId)?.downloadCount + 1 || 1,
      lastDownload: new Date().toISOString()
    })

    if (document) {
      // Add download activity log
      this.addActivityLog({
        type: 'download',
        action: 'Document Downloaded',
        fileName: document.fileName,
        ipfsHash: document.ipfsHash,
        user: document.uploader, // In real app, this would be current user
        timestamp: new Date().toISOString(),
        blockNumber: document.blockNumber + Math.floor(Math.random() * 10),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        gasUsed: (Math.floor(Math.random() * 20000) + 20000).toString(),
        status: 'confirmed'
      })
    }

    return document
  }

  /**
   * Get activity logs from local storage
   * @returns {Array} Array of activity log objects
   */
  getActivityLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading activity logs from localStorage:', error)
      return []
    }
  }

  /**
   * Add a new activity log entry
   * @param {Object} activity - Activity log object
   */
  addActivityLog(activity) {
    try {
      const logs = this.getActivityLogs()
      const newLog = {
        id: `${activity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString()
      }

      // Add to beginning (most recent first)
      logs.unshift(newLog)
      
      // Keep only last 1000 entries to prevent storage bloat
      const trimmedLogs = logs.slice(0, 1000)
      
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(trimmedLogs))
      return newLog
    } catch (error) {
      console.error('Error saving activity log to localStorage:', error)
      throw error
    }
  }

  /**
   * Clear all stored data
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      throw error
    }
  }

  /**
   * Get documents for a specific user address
   * @param {string} userAddress - User wallet address
   * @returns {Array} Filtered documents for the user
   */
  getUserDocuments(userAddress) {
    const allDocuments = this.getDocuments()
    return allDocuments.filter(doc => 
      doc.uploader?.toLowerCase() === userAddress?.toLowerCase()
    )
  }

  /**
   * Get MIME type from file extension
   * @param {string} fileName - File name
   * @returns {string} MIME type
   */
  getMimeType(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return 'application/pdf'
      case 'doc': case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'txt': return 'text/plain'
      case 'jpg': case 'jpeg': return 'image/jpeg'
      case 'png': return 'image/png'
      case 'gif': return 'image/gif'
      case 'zip': return 'application/zip'
      case 'rar': return 'application/x-rar-compressed'
      default: return 'application/octet-stream'
    }
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage usage statistics
   */
  getStorageStats() {
    try {
      const documents = this.getDocuments()
      const activityLogs = this.getActivityLogs()
      
      return {
        totalDocuments: documents.length,
        totalActivityLogs: activityLogs.length,
        totalSize: documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0),
        oldestDocument: documents.length > 0 ? documents[documents.length - 1].uploadDate : null,
        newestDocument: documents.length > 0 ? documents[0].uploadDate : null
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return {
        totalDocuments: 0,
        totalActivityLogs: 0,
        totalSize: 0,
        oldestDocument: null,
        newestDocument: null
      }
    }
  }

  /**
   * Search documents by filename or IPFS hash
   * @param {string} query - Search query
   * @returns {Array} Matching documents
   */
  searchDocuments(query) {
    if (!query) return this.getDocuments()
    
    const documents = this.getDocuments()
    const lowercaseQuery = query.toLowerCase()
    
    return documents.filter(doc =>
      doc.fileName.toLowerCase().includes(lowercaseQuery) ||
      doc.ipfsHash.toLowerCase().includes(lowercaseQuery) ||
      doc.mimeType.toLowerCase().includes(lowercaseQuery)
    )
  }

  /**
   * Initialize with demo data if storage is empty
   * @param {string} userAddress - Current user address
   */
  initializeDemoData(userAddress) {
    const existingDocs = this.getDocuments()
    
    // Only initialize if storage is empty
    if (existingDocs.length === 0 && userAddress) {
      const demoDocuments = [
        {
          fileName: 'SecureX_Whitepaper_v2.pdf',
          ipfsHash: 'QmXyZ123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz8',
          fileSize: 2445760, // ~2.4MB
          uploader: userAddress,
          uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          fileName: 'Smart_Contract_Audit_Report.pdf',
          ipfsHash: 'QmAbc456def789xyz123uvw456qrs789tuv012wxy345zab678cde901fgh234',
          fileSize: 1887436, // ~1.8MB
          uploader: userAddress,
          uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          fileName: 'Technical_Documentation.docx',
          ipfsHash: 'QmDef789ghi012jkl345mno678pqr901stu234vwx567yz8901abc234def567',
          fileSize: 3355443, // ~3.2MB
          uploader: userAddress,
          uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]

      demoDocuments.forEach(doc => {
        this.saveDocument(doc)
      })

      console.log('Initialized demo data with', demoDocuments.length, 'documents')
    }
  }
}

export default new LocalStorageService()
