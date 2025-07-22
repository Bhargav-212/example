import React from 'react'
import { WalletProviderWrapper, useWallet } from './WalletProviderWrapper'
import { useToast } from '../components/ui/Toast'

export { useWallet }

export const WalletProvider = ({ children }) => {
  const toast = useToast()
  
  return (
    <WalletProviderWrapper toast={toast}>
      {children}
    </WalletProviderWrapper>
  )
}
