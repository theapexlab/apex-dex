import { createContext, useContext, useEffect, useState } from 'react';
import { Contract, ethers } from 'ethers';

import ammContract from '../../avalanche/artifacts/contracts/AMM.sol/AMM.json';
import { useAuthContext } from './auth/context';

type ContractContext = {
  contractInterface: Contract | null;
};

const defaultState = {
  contractInterface: null,
};

const ContractContext = createContext<ContractContext>(defaultState);

export const ContractProvider: React.FC = ({ children }) => {
  const { authState } = useAuthContext();

  const [contractInterface, setContractInterface] = useState<Contract | null>(null);

  useEffect(() => {
    // If user is connected to site via MetaMask
    if (authState.data.length) {
      // Get the current provider (defaults to the currently selected network)
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer (defaults to the currently selected account)
      const signer = provider.getSigner();

      // This address will be different for every network
      const contractAddress = process.env.CONTRACT_ADDRESS || '';
      // Initialise the contract instance
      const contract = new ethers.Contract(contractAddress, ammContract.abi, signer);

      // Store this instance in the state
      setContractInterface(contract);
    }
  }, [authState.data]);

  return <ContractContext.Provider value={{ contractInterface }}>{children}</ContractContext.Provider>;
};

export const useContractContext = () => useContext(ContractContext);
