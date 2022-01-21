import { Dispatch, SetStateAction, useState } from 'react';
import { convNumToPrecBigNumb, getPrecFromBigNumb } from '../utils/convert';

type UseSwapHooks = {
  (props: { contract: any }): {
    error: string | null;
    token1Amount: number;
    token2Amount: number;
    setToken1Amount: Dispatch<SetStateAction<number>>;
    setToken2Amount: Dispatch<SetStateAction<number>>;
    onSwap: (token: 'token1' | 'token2', fromValue: number) => Promise<void>;
    calcSwapEstimation: (token: 'token1' | 'token2', fromValue: number | null, toValue: number | null) => Promise<void>;
  };
};

export const useSwap: UseSwapHooks = ({ contract }) => {
  const [token1Amount, setToken1Amount] = useState(0);
  const [token2Amount, setToken2Amount] = useState(0);

  const [error, setError] = useState<null | string>(null);

  const calcSwapEstimation = async (token: 'token1' | 'token2', fromValue: number | null, toValue: number | null) => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      if (token === 'token1') {
        if (fromValue !== null) {
          const estimation = await contract.getSwapToken1Estimate(convNumToPrecBigNumb(fromValue));

          setToken2Amount(getPrecFromBigNumb(estimation));
        } else if (toValue !== null) {
          const estimation = await contract.getSwapToken2EstimateGivenToken1(convNumToPrecBigNumb(toValue));
          setToken2Amount(getPrecFromBigNumb(estimation));
        }
      } else if (token === 'token2') {
        if (fromValue !== null) {
          const estimation = await contract.getSwapToken2Estimate(convNumToPrecBigNumb(fromValue));
          setToken1Amount(getPrecFromBigNumb(estimation));
        } else if (toValue !== null) {
          const estimation = await contract.getSwapToken1EstimateGivenToken2(convNumToPrecBigNumb(toValue));
          setToken1Amount(getPrecFromBigNumb(estimation));
        }
      }

      setError(null);
    } catch (error) {
      const message = (error as any)?.data?.message;
      console.log('calcSwapEstimation#error', error as any);
      if (message) {
        // eslint-disable-next-line
        setError((error as any).data.message);
      }
    }
  };

  const onSwap = async (token: 'token1' | 'token2', fromValue: number) => {
    try {
      if (!contract) {
        throw new Error('The contract does not exist!');
      }

      let response;

      if (token === 'token1') {
        response = await contract.swapToken1(convNumToPrecBigNumb(fromValue));
      } else if (token === 'token2') {
        response = await contract.swapToken2(convNumToPrecBigNumb(fromValue));
      }
      await response.wait();

      setToken1Amount(0);
      setToken2Amount(0);

      setError(null);
    } catch (error) {
      const message = (error as any)?.data?.message;
      console.log('calcSwapEstimation#error', error as any);
      if (message) {
        // eslint-disable-next-line
        setError((error as any).data.message);
      }
    }
  };

  return {
    error,
    token1Amount,
    token2Amount,
    setToken1Amount,
    setToken2Amount,
    onSwap,
    calcSwapEstimation,
  };
};
