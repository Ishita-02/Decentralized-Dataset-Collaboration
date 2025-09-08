"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Web3Service from '../components/services/Web3Service';

// 1. Create the context
const Web3Context = createContext(null);

// 2. Create the Provider component
export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [isVerifier, setIsVerifier] = useState(false);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to connect the wallet
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const acc = await Web3Service.connectWallet();
      setAccount(acc);
      const verifierInfo = await Web3Service.getVerifierInfo();
      setIsVerifier(verifierInfo.isVerifier);
      setStakedAmount(verifierInfo.stakedAmount);
    } catch (err) {
      console.error("Connection Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing connection on initial load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (await Web3Service.isConnected()) {
        await connectWallet();
      } else {
        setIsLoading(false); // No wallet connected, stop loading
      }
    };
    checkExistingConnection();

    // Listen for account changes from MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Re-check verifier status when account changes
          Web3Service.getVerifierInfo().then(info => {
            setIsVerifier(info.isVerifier);
            setStakedAmount(info.stakedAmount);
          });
        } else {
          setAccount(null);
          setIsVerifier(false);
          setStakedAmount(0);
        }
      });
    }
  }, [connectWallet]);

  // The value that will be available to all children components
  const value = {
    account,
    isVerifier,
    stakedAmount,
    isLoading,
    error,
    connectWallet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// 3. Create a custom hook for easy access to the context
export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}