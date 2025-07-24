import { IPFS_CONFIG } from '../config/contract'

class IPFSService {
  constructor() {
    this.defaultGateway = IPFS_CONFIG.gateways[0]
  }

  // Upload file to IPFS (production-ready with fallback to demo)
  async uploadFile(file, onProgress = null) {
    // Check if production IPFS is configured
    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
    const pinataSecret = import.meta.env.VITE_PINATA_SECRET

    if (pinataApiKey && pinataSecret) {
      // Use real IPFS upload
      return this.uploadToPinata(file, pinataApiKey, pinataSecret)
    }

    // Fallback to demo mode
    try {
      console.log('Using demo mode - file upload simulation:', file.name)

      // Simulate upload progress
      if (onProgress) {
        for (let progress = 0; progress <= 100; progress += 10) {
          onProgress(progress)
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      // Generate mock IPFS hash based on file content
      const fileHash = await this.generateFileHash(file)
      const hash = `QmDemo${fileHash}${Math.random().toString(36).substr(2, 15)}`

      console.log('Demo file uploaded with hash:', hash)

      return {
        success: true,
        hash,
        size: file.size,
        name: file.name,
        type: file.type,
        demoMode: true
      }
    } catch (error) {
      console.error('IPFS upload failed:', error)
      throw new Error(`IPFS upload failed: ${error.message}`)
    }
  }

  // Upload file to IPFS using Pinata (real implementation)
  async uploadToPinata(file, apiKey, apiSecret) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const pinataMetadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          uploadedBy: 'SecureX',
          timestamp: Date.now().toString()
        }
      })
      formData.append('pinataMetadata', pinataMetadata)
      
      const response = await fetch(IPFS_CONFIG.uploadEndpoints.pinata.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      return {
        success: true,
        hash: result.IpfsHash,
        size: result.PinSize,
        timestamp: result.Timestamp
      }
    } catch (error) {
      console.error('Pinata upload failed:', error)
      throw new Error(`Pinata upload failed: ${error.message}`)
    }
  }

  // Generate deterministic hash for file content
  async generateFileHash(file) {
    try {
      const buffer = await file.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex.slice(0, 20) // Use first 20 characters
    } catch (error) {
      console.error('Error generating file hash:', error)
      return Math.random().toString(36).substr(2, 20)
    }
  }

  // Get IPFS URL for a hash
  getIPFSUrl(hash, gatewayIndex = 0) {
    const gateway = IPFS_CONFIG.gateways[gatewayIndex] || this.defaultGateway
    return `${gateway}/${hash}`
  }

  // Get multiple gateway URLs for redundancy
  getIPFSUrls(hash) {
    return IPFS_CONFIG.gateways.map(gateway => `${gateway}/${hash}`)
  }

  // Download file from IPFS
  async downloadFile(hash, fileName = 'download') {
    try {
      const url = this.getIPFSUrl(hash)
      console.log('Downloading from IPFS:', url)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return {
        success: true,
        size: blob.size,
        type: blob.type
      }
    } catch (error) {
      console.error('IPFS download failed:', error)
      throw new Error(`Download failed: ${error.message}`)
    }
  }

  // Check if IPFS hash is accessible
  async checkIPFSAccess(hash) {
    try {
      const url = this.getIPFSUrl(hash)
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.error('IPFS access check failed:', error)
      return false
    }
  }

  // Get file metadata from IPFS
  async getFileMetadata(hash) {
    try {
      const url = this.getIPFSUrl(hash)
      const response = await fetch(url, { method: 'HEAD' })
      
      if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`)
      }
      
      return {
        size: parseInt(response.headers.get('content-length') || '0'),
        type: response.headers.get('content-type') || 'application/octet-stream',
        lastModified: response.headers.get('last-modified'),
        accessible: true
      }
    } catch (error) {
      console.error('Error getting file metadata:', error)
      return {
        size: 0,
        type: 'unknown',
        lastModified: null,
        accessible: false
      }
    }
  }
}

// Create singleton instance
export const ipfsService = new IPFSService()
export default ipfsService
