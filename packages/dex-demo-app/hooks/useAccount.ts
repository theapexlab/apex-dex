import { useState } from 'react';
import { PRECISION } from '../utils/config';

type UseAccountHooks = {
  (props: { contract: any }): {
    amountOfToken1: number;
    amountOfToken2: number;
    amountOfShare: number;
    getHoldings: () => Promise<void>;
  };
};

export const useAccount: UseAccountHooks = ({ contract }) => {
  const [amountOfToken1, setAmountOfToken1] = useState(0);
  const [amountOfToken2, setAmountOfToken2] = useState(0);
  const [amountOfShare, setAmountOfShare] = useState(0);

  const getHoldings = async () => {
    try {
      console.log('Fetching holdings----');

      let response = await contract.getMyHoldings();
      setAmountOfToken1(response.amountToken1 / PRECISION);
      setAmountOfToken2(response.amountToken2 / PRECISION);
      setAmountOfShare(response.myShare / PRECISION);
    } catch (err) {
      console.log("Couldn't Fetch holdings", err);
    }
  };

  return {
    amountOfToken1,
    amountOfToken2,
    amountOfShare,
    getHoldings,
  };
};
