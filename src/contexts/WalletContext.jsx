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

export const WalletProvider = ({ children }) => {
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
          setError('')
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setProvider(provider)
      setSigner(signer)
      setAddress(address)
      setChainId(network.chainId)
      setIsConnected(true)
      setError('')

      console.log('Wallet connected successfully:', address)

    } catch (error) {
      console.error('Error connecting wallet:', error)
      let errorMsg = 'Failed to connect wallet'
      
      if (error.code === 4001) {
        errorMsg = 'Connection rejected by user'
      } else if (error.code === -32002) {
        errorMsg = 'Connection request already pending'
      } else if (error.message) {
        errorMsg = error.message
      }
      
      setError(errorMsg)
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
    console.log('Wallet disconnected')
  }

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          // Account changed, update connection
          setTimeout(checkConnection, 100)
        }
      }

      const handleChainChanged = (chainId) => {
        setChainId(BigInt(chainId))
        // Reload connection after chain change
        setTimeout(checkConnection, 100)
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
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
    disconnectWallet
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
