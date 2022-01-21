import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { convNumToPrecBigNumb, getPrecFromBigNumb } from '../utils/convert';

type UsePoolHooks = {
  (props: { contract: any }): {
    totalToken1: number;
    totalToken2: number;
    totalShare: number;
    token1Amount: number;
    token2Amount: number;
    isZeroLiquidity: boolean;
    setToken1Amount: Dispatch<SetStateAction<number>>;
    setToken2Amount: Dispatch<SetStateAction<number>>;
    getPoolDetails: () => Promise<void>;
    provide: () => Promise<void>;
    calcProvideEstimation: (token: 'token1' | 'token2', value: number) => Promise<void>;
  };
};

export const usePool: UsePoolHooks = ({ contract }) => {
  const [totalToken1, setTotalToken1] = useState(0);
  const [totalToken2, setTotalToken2] = useState(0);
  const [totalShare, setTotalShare] = useState(0);

  const [token1Amount, setToken1Amount] = useState(0);
  const [token2Amount, setToken2Amount] = useState(0);

  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (contract) {
      getPoolDetails();
    }
  }, [contract]);

  const calcProvideEstimation = async (token: 'token1' | 'token2', value: number) => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      if (token === 'token1') {
        const estimation = await contract.getEquivalentToken2Estimate(convNumToPrecBigNumb(value));
        setToken2Amount(getPrecFromBigNumb(estimation));
      } else if (token === 'token2') {
        const estimation = await contract.getEquivalentToken1Estimate(convNumToPrecBigNumb(value));
        setToken1Amount(getPrecFromBigNumb(estimation));
      }

      // Update the pool amounts
      getPoolDetails();
      setError(null);
    } catch (error) {
      const message = (error as any)?.data?.message;
      console.log('getProvideEstimation#error', error as any);
      if (message) {
        // eslint-disable-next-line
        setError((error as any).data.message);
      }
    }
  };

  const provide = async () => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      const response = await contract.provide(convNumToPrecBigNumb(token1Amount), convNumToPrecBigNumb(token2Amount));
      await response.wait();
      setToken1Amount(0);
      setToken2Amount(0);

      // Update the pool amounts
      getPoolDetails();

      setError(null);
    } catch (error) {
      const message = (error as any)?.data?.message;
      console.log('provide#error', error as any);
      if (message) {
        // eslint-disable-next-line
        setError((error as any).data.message);
      }
    }
  };

  const getPoolDetails = async () => {
    try {
      console.log('Fetching pool details----');

      const response = await contract.getPoolDetails();
      setTotalToken1(getPrecFromBigNumb(response[0]));
      setTotalToken2(getPrecFromBigNumb(response[1]));
      setTotalShare(getPrecFromBigNumb(response[2]));
    } catch (err) {
      console.log("Couldn't Fetch holdings", err);
    }
  };

  return {
    isZeroLiquidity: !!error?.toLowerCase().includes('zero liquidity'),
    totalToken1,
    totalToken2,
    totalShare,
    token1Amount,
    token2Amount,
    setToken1Amount,
    setToken2Amount,
    getPoolDetails,
    provide,
    calcProvideEstimation,
  };
};
