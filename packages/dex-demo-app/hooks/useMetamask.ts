import { useState, useRef, useEffect } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';

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
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      if (window.ethereum.isConnected()) {
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(setAccounts);
      }

      window.ethereum.on('accountsChanged', setAccounts);
      return () => {
        window.ethereum.removeListener('accountsChanged', setAccounts);
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
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(setAccounts);
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
