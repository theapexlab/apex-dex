import { BigNumber, Contract, Transaction } from 'ethers';
import { useEffect, useState } from 'react';
import { getPrecFromBigNumb } from '../utils/convert';

type UseAccountHooks = {
  (props: { contract: Contract | null }): {
    amountOfToken1: number;
    amountOfToken2: number;
    amountOfShare: number;
    getHoldings: () => Promise<void>;
    faucetWallet: (token1: number, token2: number) => Promise<Transaction | null>;
  };
};

export const useWalletAccount: UseAccountHooks = ({ contract }) => {
  const [amountOfToken1, setAmountOfToken1] = useState(0);
  const [amountOfToken2, setAmountOfToken2] = useState(0);
  const [amountOfShare, setAmountOfShare] = useState(0);

  useEffect(() => {
    if (contract) {
      getHoldings();
    }
  }, [contract]);

  const faucetWallet = async (token1: number, token2: number): Promise<Transaction | null> => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      const tx = await contract.faucet(BigNumber.from(token1), BigNumber.from(token2));

      const transaction = await tx.wait();
      console.log('response', transaction);

      // Update the holdings
      // not need to await
      getHoldings();

      return transaction;
    } catch (error) {
      console.log('faucetWallet#error', (error as Error).message);
      return null;
    }
  };

  const getHoldings = async () => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      const response = await contract.getMyHoldings();

      setAmountOfToken1(getPrecFromBigNumb(response.amountToken1));
      setAmountOfToken2(getPrecFromBigNumb(response.amountToken2));
      setAmountOfShare(getPrecFromBigNumb(response.myShare));
    } catch (err) {
      console.log("Couldn't Fetch holdings", (err as Error).message);
    }
  };

  return {
    amountOfToken1,
    amountOfToken2,
    amountOfShare,
    faucetWallet,
    getHoldings,
  };
};
