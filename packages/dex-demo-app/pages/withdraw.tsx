import type { NextPage } from 'next';

import { ChangeEvent, useState } from 'react';
import { InputGroup } from '../components/inputGroup';
import { Layout } from '../components/layout';
import { Loader } from '../components/loader';
import { LoggedOutState } from '../components/loggedOutState';
import { useAuthContext } from '../context/auth/context';
import { useContractContext } from '../context/contractProvider';
import { useWithdraw } from '../hooks/useWithdraw';

const Withdraw: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  const { authState } = useAuthContext();
  const { contractInterface } = useContractContext();

  const { amountOfShare, estimateTokens, calcWithdrawEstimate, calcMaxShare, withdraw } = useWithdraw({
    contract: contractInterface,
  });

  const onChangeAmount = (e: ChangeEvent<HTMLInputElement>) => calcWithdrawEstimate(parseFloat(e.target.value) || 0);

  const onWithdraw = async () => {
    setLoading(true);
    await withdraw();
    setLoading(false);
  };

  return (
    <Layout title="Faucet" description="Faucet page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdraw</h1>
      </div>

      <div className="relative flex flex-col items-center py-8 space-y-8">
        {authState.error ? (
          <LoggedOutState />
        ) : (
          <>
            <div className="flex flex-col items-end space-y-2">
              <button onClick={calcMaxShare} className="text-sm font-bold">
                Max
              </button>
              <InputGroup
                type="number"
                label="amount"
                currency=""
                value={amountOfShare}
                aria-describedby="token1-currency"
                onChange={onChangeAmount}
              />
            </div>

            {estimateTokens.length > 0 && (
              <div className="">
                <div className="">Amount of TOKEN1: {estimateTokens[0]}</div>
                <div className="">Amount of TOKEN2: {estimateTokens[1]}</div>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              className="w-32 flex justify-center items-center px-4 py-2 border bg-slate-800 shadow-sm text-sm font-medium rounded-md text-white  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              onClick={onWithdraw}>
              {isLoading ? <Loader /> : 'Withdraw'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Withdraw;
