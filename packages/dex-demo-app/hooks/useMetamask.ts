import { useState, useRef, useEffect } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';

type ExtendedWindow = Window & typeof globalThis & { ethereum: any };

type UseMetamaskHook = {
  (): {
    isConnected: boolean;
    isLoading: boolean;
    accounts: string[] | null;
    connectMetamask: () => Promise<void>;
  };
};

export const useMetamask: UseMetamaskHook = () => {
  const [accounts, setAccounts] = useState<string[] | null>(null);

  const onboarding = useRef<MetaMaskOnboarding>();

  useEffect(() => {
    if (!onboarding.current) {
      onboarding.current = new MetaMaskOnboarding();
    }
  }, []);

  useEffect(() => {
    const extendedWindow = window as ExtendedWindow;
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (extendedWindow.ethereum.isConnected()) {
        extendedWindow.ethereum.request({ method: 'eth_requestAccounts' }).then(setAccounts);
      }

      extendedWindow.ethereum.on('accountsChanged', setAccounts);
      return () => {
        extendedWindow.ethereum.removeListener('accountsChanged', setAccounts);
      };
    }
  }, []);

  useEffect(() => {
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (accounts && accounts.length > 0 && onboarding.current) {
        onboarding.current.stopOnboarding();
      }
    }
  }, [accounts]);

  const connectMetamask = async () => {
    try {
      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        (window as ExtendedWindow).ethereum.request({ method: 'eth_requestAccounts' }).then(setAccounts);
      } else if (onboarding.current) {
        onboarding.current.startOnboarding();
      }
    } catch (error) {
      console.error('Could not connect to the Metamask');
    }
  };

  console.log('isConnected', accounts);

  return {
    isConnected: !!accounts && accounts.length > 0,
    isLoading: accounts === null,
    accounts,
    connectMetamask,
  };
};
