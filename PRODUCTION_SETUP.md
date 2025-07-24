# Production Setup Guide

## 1. Smart Contract Deployment

### Deploy to Sepolia Testnet
```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Create deployment script
npx hardhat init

# Deploy contract
npx hardhat run scripts/deploy.js --network sepolia
```

### Contract Code (contracts/SecureXDocuments.sol)
```solidity
// SPDX-License-Identifier: MIT
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
}
```

## 2. IPFS Integration

### Option A: Pinata Service
```bash
# Sign up at https://pinata.cloud
# Get API keys
# Add to environment variables
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
```

### Option B: NFT.Storage
```bash
# Sign up at https://nft.storage
# Get API token
NFT_STORAGE_API_KEY=your_api_key
```

## 3. Backend API Setup

### Create Production Backend
```bash
cd backend
npm install express cors helmet rate-limiter multer

# Add environment variables
NODE_ENV=production
PORT=3001
PINATA_API_KEY=your_key
PINATA_SECRET=your_secret
```

## 4. Environment Configuration

### Create .env file
```bash
# Blockchain
VITE_CONTRACT_ADDRESS_SEPOLIA=0xYourContractAddress
VITE_CONTRACT_ADDRESS_MAINNET=0xYourMainnetAddress

# IPFS
VITE_PINATA_API_KEY=your_pinata_key
VITE_PINATA_SECRET=your_pinata_secret

# Backend
VITE_API_URL=https://your-api.com

# Network
VITE_INFURA_PROJECT_ID=your_infura_id
```

## 5. Production Build

### Build and Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to hosting service
# - Vercel
# - Netlify  
# - AWS S3 + CloudFront
# - Firebase Hosting
```

## Cost Estimates (Monthly)

### Minimal Setup
- Smart Contract Deployment: $50-100 (one-time)
- IPFS Storage (Pinata): $20/month
- Backend Hosting: $10-25/month
- Frontend Hosting: $0-10/month

### Enterprise Setup
- Dedicated IPFS Nodes: $200-500/month
- Backend Infrastructure: $100-300/month
- CDN & Security: $50-150/month
- Monitoring & Analytics: $50-100/month

## Security Considerations

1. **Smart Contract Audit**: $5,000-15,000
2. **Bug Bounty Program**: $1,000-5,000/month
3. **Security Monitoring**: $100-300/month
4. **Backup & Recovery**: $50-200/month
