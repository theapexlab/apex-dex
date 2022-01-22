import { useState } from 'react';
import { convNumToPrecBigNumb, getPrecFromBigNumb } from '../utils/convert';
import { useWalletAccount } from './useWalletAccount';

type UseWithdrawHooks = {
  (props: { contract: any }): {
    estimateTokens: number[];
    amountOfShare: number;
    calcMaxShare: () => Promise<void>;
    calcWithdrawEstimate: (amount: number) => Promise<void>;
    withdraw: () => Promise<void>;
  };
};

export const useWithdraw: UseWithdrawHooks = ({ contract }) => {
  const [amountOfShare, setAmountOfShare] = useState(0);
  const [estimateTokens, setEstimateTokens] = useState<number[]>([]);

  const { amountOfShare: maxAmountOfShare, getHoldings } = useWalletAccount({ contract });

  // Gets the maximun share one can withdraw
  const calcMaxShare = async () => calcWithdrawEstimate(maxAmountOfShare);

  const calcWithdrawEstimate = async (amount: number) => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      setAmountOfShare(amount);
      const response = await contract.getWithdrawEstimate(convNumToPrecBigNumb(amount));

      setEstimateTokens([getPrecFromBigNumb(response.amountToken1), getPrecFromBigNumb(response.amountToken2)]);
    } catch (error) {
      console.log('getWithdrawEstimate#error', error);
    }
  };

  const withdraw = async () => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      if (maxAmountOfShare < amountOfShare) {
        throw new Error('Amount should be less than your max share');
      }

      const response = await contract.withdraw(convNumToPrecBigNumb(amountOfShare));
      await response.wait();

      setAmountOfShare(0);
      setEstimateTokens([]);

      await getHoldings();
    } catch (error) {
      console.log('withdraw#error', error);
    }
  };

  return {
    estimateTokens,
    amountOfShare,
    calcMaxShare,
    calcWithdrawEstimate,
    withdraw,
  };
};
