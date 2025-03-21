"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { UserInfo } from "@/lib/utils";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Ethereum Sepolia Testnet
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

interface Web3AuthContextProps {
  web3auth: Web3Auth | null;
  provider: any;
  userInfo: UserInfo | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextProps>({
  web3auth: null,
  provider: null,
  userInfo: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useWeb3Auth = () => useContext(Web3AuthContext);

interface Web3AuthProviderProps {
  children: React.ReactNode;
}

export function Web3AuthProvider({ children }: Web3AuthProviderProps) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Check if window is defined to avoid SSR issues
        if (typeof window === "undefined") return;

        const ethereumProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId: "BD_mes2shHCQIycGpb1E6o8OWYzLOnjFBHgv9nYd3xHl5xE3XjG8qjaT5g1_jEVPWJ8ZTexeZiuXFwYb-9avE1Y",
          web3AuthNetwork: "sapphire_devnet",
          chainConfig,
          privateKeyProvider: ethereumProvider,
        });

        setWeb3auth(web3auth);

        await web3auth.initModal();

        // Check if the user is already logged in
        if (web3auth.provider) {
          setProvider(web3auth.provider);
          
          // Get user info
          const userInfo = await web3auth.getUserInfo();
          const accounts = await ethereumProvider.request({ method: "eth_accounts" }) as string[];
          
          setUserInfo({
            name: userInfo.name,
            profileImage: userInfo.profileImage,
            walletAddress: accounts[0],
            email: userInfo.email,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Web3Auth", error);
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized");
    }
    
    try {
      const provider = await web3auth.connect();
      setProvider(provider);
      
      if (provider) {
        const userInfo = await web3auth.getUserInfo();
        const ethereumProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });
        const accounts = await ethereumProvider.request({ method: "eth_accounts" }) as string[];
        
        setUserInfo({
          name: userInfo.name,
          profileImage: userInfo.profileImage,
          walletAddress: accounts[0],
          email: userInfo.email,
        });
      }
    } catch (error) {
      console.error("Error logging in with Web3Auth", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized");
    }
    
    try {
      await web3auth.logout();
      setProvider(null);
      setUserInfo(null);
    } catch (error) {
      console.error("Error logging out with Web3Auth", error);
    }
  };

  const contextValue = {
    web3auth,
    provider,
    userInfo,
    isLoading,
    login,
    logout,
  };

  return (
    <Web3AuthContext.Provider value={contextValue}>
      {children}
    </Web3AuthContext.Provider>
  );
} 