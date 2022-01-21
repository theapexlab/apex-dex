import type { NextPage } from 'next';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { SwitchVerticalIcon } from '@heroicons/react/solid';
import { InputGroup } from '../components/inputGroup';
import { Layout } from '../components/layout';
import { Loader } from '../components/loader';
import { LoggedOutState } from '../components/loggedOutState';
import { useAuthContext } from '../context/auth/context';
import { useContractContext } from '../context/contractProvider';
import { useWalletAccount } from '../hooks/useWalletAccount';
import { useSwap } from '../hooks/useSwap';

type Layout = {
  key: 'token1' | 'token2';
  currency: string;
};

const layoutList: Layout[] = [
  {
    key: 'token1',
    currency: 'TOKEN1',
  },
  {
    key: 'token2',
    currency: 'TOKEN2',
  },
];

const Swap: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  const [layout, setLayout] = useState<{ 0: Layout; 1: Layout }>({ 0: layoutList[0], 1: layoutList[1] });

  const { authState } = useAuthContext();
  const { contractInterface } = useContractContext();

  // Tokens to swap
  const { token1Amount, token2Amount, setToken1Amount, setToken2Amount, calcSwapEstimation, onSwap } = useSwap({
    contract: contractInterface,
  });

  // The actual balance of the user
  const { amountOfToken1, amountOfToken2, getHoldings } = useWalletAccount({ contract: contractInterface });

  const currentBalances = { [layoutList[0].key]: amountOfToken1, [layoutList[1].key]: amountOfToken2 };
  const amounts = { [layoutList[0].key]: token1Amount, [layoutList[1].key]: token2Amount };

  useEffect(() => {
    if (contractInterface) {
      calcSwapEstimation(layout[0].key, amounts[layout[0].key], null);
    }
  }, [layout, contractInterface]);

  const setTokenValue = (token: 'token1' | 'token2') => async (e: ChangeEvent<HTMLInputElement>) => {
    const numberValue = parseFloat(e.target.value) || 0;

    // If the from value is given
    const isFrom = token === layout[0].key;

    if (isFrom) {
      await calcSwapEstimation(token, numberValue, null);
    } else {
      await calcSwapEstimation(token, null, numberValue);
    }

    if (token === 'token1') {
      setToken1Amount(numberValue || 0);
    } else {
      setToken2Amount(numberValue || 0);
    }
  };

  const onSwapTokens = async () => {
    try {
      setLoading(true);

      const fromValue = amounts[layout[0].key];
      if (fromValue) {
        await onSwap(layout[0].key, fromValue);

        getHoldings();
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const onSwitch = () => {
    setLayout((layout) => ({ 0: layout[1], 1: layout[0] }));
  };

  const balanceFrom = currentBalances[layout[0].key] - amounts[layout[0].key];
  const balanceTo = currentBalances[layout[1].key] + amounts[layout[1].key];

  return (
    <Layout title="Faucet" description="Faucet page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Swap</h1>
      </div>

      <div className="relative flex flex-col items-center py-8 space-y-8">
        {authState.error ? (
          <LoggedOutState />
        ) : (
          <>
            <div className="flex flex-col items-end space-y-2">
              <span className={`text-sm font-bold ${balanceFrom < 0 ? 'text-rose-600' : ''}`}>
                My balance: {balanceFrom}
              </span>
              <InputGroup
                type="number"
                label="From"
                value={amounts[layout[0].key]}
                currency={layout[0].currency}
                aria-describedby={`${layout[0].key}-currency`}
                onChange={setTokenValue(layout[0].key)}
              />
            </div>
            <button onClick={onSwitch}>
              <SwitchVerticalIcon className="h-5 w-5 text-slate-700" aria-hidden="true" />
            </button>
            <div className="flex flex-col items-end space-y-2">
              <span className={`text-sm font-bold`}>My balance: {balanceTo}</span>
              <InputGroup
                type="number"
                label="To"
                value={amounts[layout[1].key]}
                currency={layout[1].currency}
                aria-describedby={`${layout[1].key}-currency`}
                onChange={setTokenValue(layout[1].key)}
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              className="w-32 flex justify-center items-center px-4 py-2 border bg-slate-800 shadow-sm text-sm font-medium rounded-md text-white  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              onClick={onSwapTokens}>
              {isLoading ? <Loader /> : 'Swap'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Swap;
