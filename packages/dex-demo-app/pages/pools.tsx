import type { NextPage } from 'next';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Info } from '../components/info';
import { InputGroup } from '../components/inputGroup';
import { Layout } from '../components/layout';
import { Loader } from '../components/loader';
import { LoggedOutState } from '../components/loggedOutState';
import { useAuthContext } from '../context/auth/context';
import { useContractContext } from '../context/contractProvider';
import { usePool } from '../hooks/usePool';
import { useWalletAccount } from '../hooks/useWalletAccount';
import { PRECISION } from '../utils/config';

const Pools: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  const { authState } = useAuthContext();
  const { contractInterface } = useContractContext();

  const {
    isZeroLiquidity,
    totalToken1,
    totalToken2,
    token1Amount,
    token2Amount,
    calcProvideEstimation,
    setToken1Amount,
    setToken2Amount,
    provide,
  } = usePool({
    contract: contractInterface,
  });

  const onProvideFund = async () => {
    try {
      setLoading(true);

      if (token1Amount > 0 || token2Amount > 0) {
        await provide();
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractInterface) {
      // Check if the pool is empty
      calcProvideEstimation('token1', 0);
    }
  }, [contractInterface]);

  const onChangeHandler = (token: 'token1' | 'token2') => async (e: ChangeEvent<HTMLInputElement>) => {
    const numberValue = parseFloat(e.target.value);

    if (!!numberValue && !isZeroLiquidity) {
      await calcProvideEstimation(token, numberValue);
    }
    if (token === 'token1') {
      setToken1Amount(numberValue || 0);
    } else {
      setToken2Amount(numberValue || 0);
    }
  };

  return (
    <Layout title="Faucet" description="Faucet page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Pools</h1>
      </div>

      {isZeroLiquidity && <Info icon="💰" message="The pool is empty. Set the initial conversion rate." />}

      <div className="relative flex flex-col items-center py-8 space-y-8">
        {authState.error ? (
          <LoggedOutState />
        ) : (
          <>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-sm font-bold">Balance: {totalToken1}</span>
              <InputGroup
                type="number"
                label="amount of TOKEN1"
                currency="TOKEN1"
                value={token1Amount}
                aria-describedby="token1-currency"
                onChange={onChangeHandler('token1')}
              />
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-sm font-bold">Balance: {totalToken2}</span>
              <InputGroup
                type="number"
                label="amount of TOKEN2"
                currency="TOKEN2"
                value={token2Amount}
                aria-describedby="token2-currency"
                onChange={onChangeHandler('token2')}
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              className="w-32 flex justify-center items-center px-4 py-2 border bg-slate-800 shadow-sm text-sm font-medium rounded-md text-white  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              onClick={onProvideFund}>
              {isLoading ? <Loader /> : 'Provide'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Pools;
