import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import GlassCard from './GlassCard'
import NeonButton from './NeonButton'
import { useToast } from './Toast'

const FreeBlockchainSetup = () => {
  // Load state from localStorage on component mount
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('securex_blockchain_setup_step')
    return saved ? parseInt(saved) : 1
  })

  const [contractAddress, setContractAddress] = useState(() => {
    return localStorage.getItem('securex_blockchain_setup_address') || ''
  })

  const [isCompleted, setIsCompleted] = useState(() => {
    return localStorage.getItem('securex_blockchain_setup_completed') === 'true'
  })

  const toast = useToast()

  // Save state to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('securex_blockchain_setup_step', currentStep.toString())
  }, [currentStep])

  React.useEffect(() => {
    localStorage.setItem('securex_blockchain_setup_address', contractAddress)
  }, [contractAddress])

  React.useEffect(() => {
    localStorage.setItem('securex_blockchain_setup_completed', isCompleted.toString())
  }, [isCompleted])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy')
    })
  }

  const handleComplete = () => {
    if (contractAddress) {
      // Show completion message
      setIsCompleted(true)
      toast.success('🎉 Blockchain setup complete! Your contract is ready to use.')

      // Auto-copy the configuration
      const configCode = `// Update your contract address in src/config/contract.js
export const CONTRACT_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorer: 'https://sepolia.etherscan.io',
    contractAddress: '${contractAddress}', // ← Your deployed contract
  },
  // ... rest of config
}`

      copyToClipboard(configCode)
    } else {
      toast.error('Please enter your contract address first')
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setContractAddress('')
    setIsCompleted(false)
    localStorage.removeItem('securex_blockchain_setup_step')
    localStorage.removeItem('securex_blockchain_setup_address')
    localStorage.removeItem('securex_blockchain_setup_completed')
    toast.success('Setup wizard reset successfully')
  }

  const handleNext = () => {
    if (currentStep === steps.length) {
      handleComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureXDocuments {
    struct Document {
        string fileName;
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        uint256 fileSize;
        bool isActive;
    }
    
    mapping(uint256 => Document) public documents;
    mapping(address => uint256[]) public userDocuments;
    uint256 public documentCount;
    
    event DocumentUploaded(uint256 indexed documentId, address indexed uploader, string fileName, string ipfsHash);
    event DocumentViewed(uint256 indexed documentId, address indexed viewer, uint256 timestamp);
    
    function uploadDocument(string memory _fileName, string memory _ipfsHash, uint256 _fileSize) public {
        documentCount++;
        documents[documentCount] = Document(_fileName, _ipfsHash, msg.sender, block.timestamp, _fileSize, true);
        userDocuments[msg.sender].push(documentCount);
        emit DocumentUploaded(documentCount, msg.sender, _fileName, _ipfsHash);
    }
    
    function getUserDocuments(address _user) public view returns (uint256[] memory) {
        return userDocuments[_user];
    }
    
    function getDocument(uint256 _documentId) public view returns (string memory, string memory, address, uint256, uint256, bool) {
        Document memory doc = documents[_documentId];
        return (doc.fileName, doc.ipfsHash, doc.uploader, doc.timestamp, doc.fileSize, doc.isActive);
    }
    
    function getDocumentCount() public view returns (uint256) {
        return documentCount;
    }
}`

  const steps = [
    {
      id: 1,
      title: "Get Free Test ETH",
      description: "Get free Sepolia testnet ETH for contract deployment",
      icon: CubeIcon,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <h4 className="text-green-400 font-medium mb-2">💰 Free Sepolia ETH Faucets</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/30 rounded">
                <div>
                  <p className="text-white font-medium">Sepolia Faucet</p>
                  <p className="text-gray-400 text-sm">Quick and reliable</p>
                </div>
                <NeonButton 
                  size="sm" 
                  onClick={() => window.open('https://sepoliafaucet.com', '_blank')}
                >
                  Get ETH
                </NeonButton>
              </div>
              <div className="flex items-center justify-between p-3 bg-black/30 rounded">
                <div>
                  <p className="text-white font-medium">Chainlink Faucet</p>
                  <p className="text-gray-400 text-sm">Alternative source</p>
                </div>
                <NeonButton 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open('https://faucets.chain.link/sepolia', '_blank')}
                >
                  Get ETH
                </NeonButton>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 <strong>Tip:</strong> You only need a small amount (~0.01 ETH) for contract deployment.
              This is completely free test ETH with no real value.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Deploy Smart Contract",
      description: "Deploy your SecureX contract using Remix IDE",
      icon: GlobeAltIcon,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="text-purple-400 font-medium mb-2">🚀 Deploy with Remix IDE</h4>
            <div className="space-y-3">
              <NeonButton 
                className="w-full"
                onClick={() => window.open('https://remix.ethereum.org', '_blank')}
              >
                <GlobeAltIcon className="w-4 h-4 mr-2" />
                Open Remix IDE
              </NeonButton>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-white font-medium">Contract Code</h5>
              <button
                onClick={() => copyToClipboard(contractCode)}
                className="flex items-center space-x-1 text-neon-green hover:text-green-300 transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </button>
            </div>
            
            <div className="relative">
              <pre className="text-xs bg-black/50 p-4 rounded border overflow-x-auto text-gray-300 max-h-40">
                {contractCode}
              </pre>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h5 className="text-yellow-400 font-medium mb-2">📋 Deployment Steps</h5>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Create new file: <code className="text-yellow-400">SecureXDocuments.sol</code></li>
              <li>Paste the contract code above</li>
              <li>Click "Solidity Compiler" → "Compile"</li>
              <li>Click "Deploy & Run" → Environment: "Injected Provider"</li>
              <li>Connect MetaMask to Sepolia testnet</li>
              <li>Click "Deploy" button</li>
              <li>Copy the deployed contract address</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Update Configuration",
      description: "Configure SecureX to use your deployed contract",
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Deployed Contract Address
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x1234567890123456789012345678901234567890"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-neon-green transition-all duration-200"
              />
            </div>
          </div>

          {contractAddress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-green-400 font-medium">✅ Configuration Code</h5>
                <button
                  onClick={() => copyToClipboard(`contractAddress: '${contractAddress}',`)}
                  className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  <span className="text-sm">Copy</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-300 space-y-2">
                <p>Update <code className="text-green-400">src/config/contract.js</code>:</p>
                <pre className="bg-black/50 p-3 rounded border overflow-x-auto">
{`export const CONTRACT_CONFIG = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorer: 'https://sepolia.etherscan.io',
    contractAddress: '${contractAddress}', // ← Your contract
  }
}`}
                </pre>
              </div>
            </motion.div>
          )}

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              💡 <strong>Alternative:</strong> Use the Contract Address Validator on the Overview page 
              to validate your address and generate the configuration code automatically.
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            {isCompleted ? '✅ Blockchain Features Active' : '🎉 Add FREE Blockchain Features'}
          </h3>
          <p className="text-gray-400">
            {isCompleted
              ? 'Your smart contract is deployed and ready to use'
              : 'Deploy a smart contract on Sepolia testnet at zero cost'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${currentStep >= step.id 
                    ? 'bg-neon-green text-gray-900' 
                    : 'bg-white/10 text-gray-400'
                  }
                `}
              >
                {currentStep > step.id ? '✓' : step.id}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`
                    w-16 h-0.5 mx-2 transition-all duration-300
                    ${currentStep > step.id ? 'bg-neon-green' : 'bg-white/20'}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3">
            <currentStepData.icon className="w-6 h-6 text-neon-green" />
            <div>
              <h4 className="text-lg font-semibold text-white">{currentStepData.title}</h4>
              <p className="text-gray-400 text-sm">{currentStepData.description}</p>
            </div>
          </div>

          {currentStepData.content}

          {/* Completion Message */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-green-400 font-bold text-lg mb-2">🎉 Setup Complete!</h4>
              <p className="text-gray-300 text-sm mb-4">
                Your blockchain features are now active. Configuration code has been copied to clipboard.
              </p>
              <div className="space-y-2">
                <p className="text-green-400 text-sm font-medium">✅ Contract deployed successfully</p>
                <p className="text-green-400 text-sm font-medium">✅ Configuration generated</p>
                <p className="text-green-400 text-sm font-medium">✅ Ready for Web3 features</p>
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-blue-400 text-sm font-medium">Next Steps:</p>
                <p className="text-gray-300 text-xs">
                  Update src/config/contract.js with the copied configuration, then connect your wallet to start using blockchain features!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <NeonButton
            variant="outline"
            disabled={currentStep === 1 || isCompleted}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous
          </NeonButton>

          <NeonButton
            disabled={isCompleted || (currentStep === steps.length && !contractAddress.trim())}
            onClick={handleNext}
          >
            {isCompleted ? '✅ Completed' : currentStep === steps.length ? 'Complete Setup' : 'Next'}
          </NeonButton>
        </div>
      </div>
    </GlassCard>
  )
}

export default FreeBlockchainSetup
