import { useState } from 'react';
import { PRECISION } from '../utils/config';

type UsePoolHooks = {
  (props: { contract: any }): {
    totalToken1: number;
    totalToken2: number;
    totalShare: number;
    getPoolDetails: () => Promise<void>;
  };
};

export const usePool: UsePoolHooks = ({ contract }) => {
  const [totalToken1, setTotalToken1] = useState(0);
  const [totalToken2, setTotalToken2] = useState(0);
  const [totalShare, setTotalShare] = useState(0);

  const getPoolDetails = async () => {
    try {
      console.log('Fetching pool details----');

      const response = await contract.getPoolDetails();
      setTotalToken1(response[0] / PRECISION);
      setTotalToken2(response[1] / PRECISION);
      setTotalShare(response[2] / PRECISION);
    } catch (err) {
      console.log("Couldn't Fetch holdings", err);
    }
  };

  return {
    totalToken1,
    totalToken2,
    totalShare,
    getPoolDetails,
  };
};
