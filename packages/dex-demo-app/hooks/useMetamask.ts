import { useState } from 'react';
import { ethers } from 'ethers';

type ExtendedWindow = Window & typeof globalThis & { ethereum: any };

type UseMetamaskHook = {
  (): {
    address: string | null;
    connectToMetamask: () => Promise<void>;
  };
};

export const useMetamask: UseMetamaskHook = () => {
  const [address, setAddress] = useState<string | null>(null);

  const connectToMetamask = async () => {
    try {
      const extendedWindow = window as ExtendedWindow;
      await extendedWindow.ethereum.enable();
      const provider = new ethers.providers.Web3Provider(extendedWindow.ethereum);
      const add = await provider.getSigner().getAddress();
      setAddress(add);
    } catch (error) {
      console.error('Could not connect to the Metamask');
    }
  };

  return {
    address,
    connectToMetamask,
  };
};
