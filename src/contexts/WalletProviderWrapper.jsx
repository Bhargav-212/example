import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProviderWrapper = ({ children, toast }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if wallet is already connected on app load
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const network = await provider.getNetwork()
          
          setProvider(provider)
          setSigner(signer)
          setAddress(address)
          setChainId(network.chainId)
          setIsConnected(true)
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      const errorMsg = 'MetaMask is not installed. Please install MetaMask to continue.'
      setError(errorMsg)
      if (toast) toast.error(errorMsg)
      return
    }

    setLoading(true)
    setError('')

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setChainId(network.chainId)
      setIsConnected(true)

      if (toast) toast.success(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`)

      // Switch to Polygon Mumbai testnet if not already connected
      if (network.chainId !== 80001n) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x13881' }], // Mumbai testnet
          })
          if (toast) toast.success('Switched to Polygon Mumbai testnet')
        } catch (switchError) {
          // If the chain doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x13881',
                chainName: 'Polygon Mumbai',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/']
              }]
            })
            if (toast) toast.success('Added and switched to Polygon Mumbai testnet')
          } else {
            if (toast) toast.warning('Please switch to Polygon Mumbai for full functionality')
          }
        }
      }

    } catch (error) {
      console.error('Error connecting wallet:', error)
      const errorMsg = error.message || 'Failed to connect wallet'
      setError(errorMsg)
      if (toast) toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress('')
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setError('')
    if (toast) toast.info('Wallet disconnected')
  }

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
      if (toast) toast.success('Network switched successfully')
    } catch (error) {
      console.error('Error switching network:', error)
      const errorMsg = 'Failed to switch network'
      setError(errorMsg)
      if (toast) toast.error(errorMsg)
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          checkConnection()
        }
      }

      const handleChainChanged = (chainId) => {
        setChainId(parseInt(chainId, 16))
        checkConnection()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value = {
    isConnected,
    address,
    provider,
    signer,
    chainId,
    loading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
