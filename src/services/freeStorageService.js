// SecureX Free Edition - Local Storage Service
// Uses browser localStorage instead of blockchain/IPFS for completely free operation

class FreeStorageService {
  constructor() {
    this.storageKey = 'securex_documents'
    this.settingsKey = 'securex_settings'
    this.initializeStorage()
  }

  // Initialize storage if it doesn't exist
  initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.settingsKey)) {
      localStorage.setItem(this.settingsKey, JSON.stringify({
        version: '1.0.0',
        edition: 'free',
        maxFileSize: 10 * 1024 * 1024, // 10MB limit for free version
        maxDocuments: 50 // 50 documents limit for free version
      }))
    }
  }

  // Convert file to base64 for storage
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Upload document (store locally)
  async uploadDocument(file, onProgress = null) {
    try {
      const settings = this.getSettings()
      const documents = this.getDocuments()

      // Check file size limit
      if (file.size > settings.maxFileSize) {
        throw new Error(`File size exceeds limit of ${(settings.maxFileSize / 1024 / 1024).toFixed(1)}MB for Free Edition`)
      }

      // Check document count limit
      if (documents.length >= settings.maxDocuments) {
        throw new Error(`Document limit reached (${settings.maxDocuments} documents max for Free Edition)`)
      }

      // Simulate upload progress
      if (onProgress) {
        for (let progress = 0; progress <= 100; progress += 20) {
          onProgress(progress)
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file)
      
      // Create document record
      const document = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadDate: new Date().toISOString(),
        data: base64Data,
        hash: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Save to localStorage
      documents.push(document)
      localStorage.setItem(this.storageKey, JSON.stringify(documents))

      return {
        success: true,
        documentId: document.id,
        hash: document.hash,
        size: file.size,
        name: file.name,
        type: file.type,
        timestamp: document.uploadDate
      }
    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }
  }

  // Get all documents
  getDocuments() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading documents:', error)
      return []
    }
  }

  // Get document by ID
  getDocument(documentId) {
    const documents = this.getDocuments()
    return documents.find(doc => doc.id === documentId) || null
  }

  // Download document
  async downloadDocument(documentId, fileName = 'download') {
    try {
      const document = this.getDocument(documentId)
      if (!document) {
        throw new Error('Document not found')
      }

      // Convert base64 back to blob
      const response = await fetch(document.data)
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = document.fileName || fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        fileName: document.fileName,
        size: document.fileSize
      }
    } catch (error) {
      console.error('Download failed:', error)
      throw new Error(`Download failed: ${error.message}`)
    }
  }

  // Delete document
  deleteDocument(documentId) {
    try {
      const documents = this.getDocuments()
      const filteredDocuments = documents.filter(doc => doc.id !== documentId)
      localStorage.setItem(this.storageKey, JSON.stringify(filteredDocuments))
      return true
    } catch (error) {
      console.error('Delete failed:', error)
      return false
    }
  }

  // Get storage statistics
  getStorageStats() {
    const documents = this.getDocuments()
    const settings = this.getSettings()
    
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0)
    const usedDocuments = documents.length

    return {
      documentsUsed: usedDocuments,
      documentsLimit: settings.maxDocuments,
      documentsRemaining: Math.max(0, settings.maxDocuments - usedDocuments),
      totalSizeUsed: totalSize,
      totalSizeLimit: settings.maxFileSize * settings.maxDocuments,
      averageFileSize: usedDocuments > 0 ? totalSize / usedDocuments : 0
    }
  }

  // Get settings
  getSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading settings:', error)
      return {}
    }
  }

  // Clear all data (reset)
  clearAllData() {
    localStorage.removeItem(this.storageKey)
    localStorage.removeItem(this.settingsKey)
    this.initializeStorage()
    return true
  }

  // Export data as JSON
  exportData() {
    const documents = this.getDocuments()
    const settings = this.getSettings()
    
    return {
      version: settings.version,
      edition: settings.edition,
      exportDate: new Date().toISOString(),
      documents: documents.map(doc => ({
        ...doc,
        data: '[Base64 Data Omitted]' // Don't include actual file data in export
      })),
      stats: this.getStorageStats()
    }
  }

  // Check if storage is available
  isStorageAvailable() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }
}

// Create singleton instance
export const freeStorageService = new FreeStorageService()
export default freeStorageService
