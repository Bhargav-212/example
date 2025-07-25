import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LinkIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import GlassCard from '../components/ui/GlassCard'
import NeonButton from '../components/ui/NeonButton'
import { useWallet } from '../contexts/WalletContext'
import { useToast } from '../components/ui/Toast'

const AIDocumentChat = () => {
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [documents, setDocuments] = useState([])
  const messagesEndRef = useRef(null)
  const { isConnected, address } = useWallet()
  const toast = useToast()

  // Enhanced demo documents with smart contract focus
  useEffect(() => {
    const demoDocuments = [
      {
        id: 'smart_contract',
        fileName: 'SecureX_Smart_Contract_V2.sol',
        ipfsHash: 'QmSecX123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz8',
        uploadDate: '2024-01-15',
        description: 'Latest SecureX smart contract with enhanced security features and document storage capabilities'
      },
      {
        id: 'whitepaper',
        fileName: 'SecureX_Technical_Whitepaper.pdf',
        ipfsHash: 'QmWhite789def012ghi345jkl678mno901pqr234stu567vwx890yz1234ab567cd8',
        uploadDate: '2024-01-14',
        description: 'Comprehensive technical documentation for SecureX platform architecture and blockchain integration'
      }
    ]
    setDocuments(demoDocuments)
  }, [isConnected, address])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      default:
        return '📎'
    }
  }

  const generateAIResponse = (userMessage, document) => {
    const message = userMessage.toLowerCase()

    // Enhanced smart contract responses with context awareness
    const smartContractResponses = {
      general: [
        "This Solidity smart contract implements a decentralized document storage system. It uses mappings to store document metadata and IPFS hashes for efficient retrieval.",
        "The contract includes functions for uploadDocument(), getUserDocuments(), and getDocument() - providing a complete document management system on the blockchain.",
        "Key features include: document ownership tracking, IPFS hash storage, timestamp recording, and event emission for blockchain transparency."
      ],
      security: [
        "The smart contract implements several security measures: access control through msg.sender verification, input validation, and secure mapping structures.",
        "Events like DocumentUploaded and DocumentViewed provide audit trails, making all document interactions transparent and traceable on the blockchain.",
        "The contract follows Solidity best practices: using proper data types, efficient gas usage, and protection against common vulnerabilities."
      ],
      functions: [
        "uploadDocument() stores file metadata and IPFS hash on-chain, increments document count, and emits an event for transparency.",
        "getUserDocuments() returns an array of document IDs owned by a specific address, enabling easy document discovery.",
        "getDocument() retrieves complete document information including filename, IPFS hash, uploader, timestamp, and status."
      ],
      technical: [
        "The contract uses efficient mapping structures: documents[id] for metadata and userDocuments[address] for ownership tracking.",
        "IPFS integration allows storing large files off-chain while maintaining on-chain verification through cryptographic hashes.",
        "The Document struct contains: fileName, ipfsHash, uploader, timestamp, fileSize, and isActive for comprehensive metadata."
      ]
    }

    const whitepaperResponses = {
      architecture: [
        "The SecureX architecture combines three layers: IPFS for decentralized storage, smart contracts for verification, and a React frontend for user interaction.",
        "The platform uses a hybrid approach - storing file metadata on Ethereum/Sepolia blockchain while keeping actual files on IPFS for scalability.",
        "Key components include: Web3 wallet integration (MetaMask), smart contract deployment, IPFS content addressing, and real-time blockchain interaction."
      ],
      blockchain: [
        "SecureX leverages Ethereum's security and decentralization for document verification while using IPFS for efficient file storage.",
        "The platform supports both testnet (Sepolia/Goerli) for development and mainnet for production deployments.",
        "Smart contract events provide real-time updates, enabling the frontend to display document uploads and views instantly."
      ],
      features: [
        "Core features include: wallet connection, document upload to blockchain, IPFS integration, activity tracking, and AI-powered document analysis.",
        "The platform offers both Free Edition (local storage) and Blockchain Edition (decentralized storage) to accommodate different user needs.",
        "Advanced features include contract address validation, network detection, transaction monitoring, and seamless Web3 integration."
      ]
    }

    // Determine response category based on message content and document type
    let responses = []

    if (document.fileName.toLowerCase().includes('contract') || document.fileName.toLowerCase().includes('.sol')) {
      if (message.includes('security') || message.includes('safe') || message.includes('audit')) {
        responses = smartContractResponses.security
      } else if (message.includes('function') || message.includes('method') || message.includes('how')) {
        responses = smartContractResponses.functions
      } else if (message.includes('technical') || message.includes('implement') || message.includes('code')) {
        responses = smartContractResponses.technical
      } else {
        responses = smartContractResponses.general
      }
    } else {
      if (message.includes('architecture') || message.includes('design') || message.includes('structure')) {
        responses = whitepaperResponses.architecture
      } else if (message.includes('blockchain') || message.includes('ethereum') || message.includes('decentralized')) {
        responses = whitepaperResponses.blockchain
      } else {
        responses = whitepaperResponses.features
      }
    }

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedDocument || isTyping) return

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

    const aiResponse = {
      id: Date.now() + 1,
      text: generateAIResponse(message, selectedDocument),
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
      document: selectedDocument.fileName,
      ipfsHash: selectedDocument.ipfsHash
    }

    setMessages(prev => [...prev, aiResponse])
    setIsTyping(false)
    toast.success('AI analysis complete!')
  }

  const clearChat = () => {
    setMessages([])
    toast.info('Chat cleared')
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('IPFS hash copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const openIPFS = (hash) => {
    window.open(`https://ipfs.io/ipfs/${hash}`, '_blank')
    toast.success('Opening document on IPFS')
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <GlassCard className="p-8 text-center">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access AI document chat features.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
          <SparklesIcon className="w-8 h-8 text-neon-green" />
          <span>AI Document Chat</span>
        </h1>
        <p className="text-gray-300">Ask questions about your uploaded documents using AI analysis</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <DocumentIcon className="w-5 h-5" />
              <span>Select Document</span>
            </h3>
            
            <div className="space-y-3">
              {documents.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDocument(doc)}
                  className={`
                    w-full p-3 rounded-xl text-left transition-all duration-200
                    ${selectedDocument?.id === doc.id
                      ? 'bg-neon-green/20 border border-neon-green/30 text-neon-green'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getFileIcon(doc.fileName)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs opacity-70 mt-1">{doc.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(doc.ipfsHash)
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Copy IPFS hash"
                        >
                          <LinkIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openIPFS(doc.ipfsHash)
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="View on IPFS"
                        >
                          <InformationCircleIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedDocument && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded-xl"
              >
                <p className="text-neon-green text-sm font-medium mb-2">Selected Document:</p>
                <p className="text-white text-sm">{selectedDocument.fileName}</p>
                <code className="text-xs text-gray-400 break-all">
                  {selectedDocument.ipfsHash.slice(0, 20)}...
                </code>
              </motion.div>
            )}
          </GlassCard>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <GlassCard className="h-96 lg:h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-emerald-400 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">SecureX AI Assistant</h3>
                  <p className="text-gray-400 text-sm">
                    {selectedDocument ? `Analyzing: ${selectedDocument.fileName}` : 'Select a document to start'}
                  </p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  title="Clear chat"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center mt-20">
                  <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {selectedDocument 
                      ? 'Start asking questions about your document!' 
                      : 'Select a document from the sidebar to begin'
                    }
                  </p>
                  {selectedDocument && (
                    <div className="mt-4 space-y-2 text-sm text-gray-500">
                      <p>Try asking:</p>
                      <div className="space-y-1">
                        {selectedDocument.fileName.toLowerCase().includes('contract') || selectedDocument.fileName.toLowerCase().includes('.sol') ? (
                          <>
                            <p>"How does the uploadDocument function work?"</p>
                            <p>"What security features are implemented?"</p>
                            <p>"Explain the smart contract architecture"</p>
                          </>
                        ) : (
                          <>
                            <p>"What is the SecureX platform architecture?"</p>
                            <p>"How does blockchain integration work?"</p>
                            <p>"What are the key features and benefits?"</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-xs lg:max-w-2xl px-4 py-3 rounded-2xl
                      ${msg.sender === 'user'
                        ? 'bg-neon-green text-gray-900'
                        : 'bg-white/10 text-white border border-white/20'
                      }
                    `}>
                      {msg.sender === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <SparklesIcon className="w-4 h-4 text-neon-green" />
                          <span className="text-xs text-gray-400">AI Analysis</span>
                          {msg.document && (
                            <span className="text-xs text-neon-green">• {msg.document}</span>
                          )}
                        </div>
                      )}
                      <p className="text-sm lg:text-base">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-2">{msg.timestamp}</p>
                    </div>
                  </motion.div>
                ))
              )}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-white border border-white/20 px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4 text-neon-green animate-pulse" />
                      <span className="text-sm">AI is analyzing the document...</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={selectedDocument ? "Ask about your document..." : "Select a document first"}
                  disabled={!selectedDocument || isTyping}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-200 disabled:opacity-50"
                />
                <NeonButton 
                  onClick={sendMessage}
                  disabled={!selectedDocument || !message.trim() || isTyping}
                  size="sm"
                  className="px-4"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </NeonButton>
              </div>
              
              {selectedDocument && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 AI will analyze "{selectedDocument.fileName}" to answer your questions
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default AIDocumentChat
