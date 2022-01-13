import type { NextPage } from 'next';

import { useRef, useState } from 'react';
import { InputGroup } from '../components/inputGroup';
import { Layout } from '../components/layout';
import { Loader } from '../components/loader';
import { LoggedOutState } from '../components/loggedOutState';
import { useAuthContext } from '../context/auth/context';
import { useContractContext } from '../context/contractProvider';
import { useWalletAccount } from '../hooks/useWalletAccount';
import { PRECISION } from '../utils/config';

const Faucet: NextPage = () => {
  const [isLoading, setLoading] = useState(false);

  const token1Ref = useRef<HTMLInputElement | null>(null);
  const token2Ref = useRef<HTMLInputElement | null>(null);

  const { authState } = useAuthContext();
  const { contractInterface } = useContractContext();
  const { amountOfToken1, amountOfToken2, faucetWallet } = useWalletAccount({ contract: contractInterface });

  const onFund = async () => {
    try {
      setLoading(true);

      const amountOfToken1 = token1Ref.current?.valueAsNumber || 0;
      const amountOfToken2 = token2Ref.current?.valueAsNumber || 0;

      await faucetWallet(amountOfToken1 * PRECISION, amountOfToken2 * PRECISION);

      // Set the input fields to default
      if (token1Ref.current) {
        token1Ref.current.value = '0';
      }

      if (token2Ref.current) {
        token2Ref.current.value = '0';
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <Layout title="Faucet" description="Faucet page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Faucet</h1>
      </div>

      <div className="relative flex flex-col items-center py-8 space-y-8">
        {authState.error ? (
          <LoggedOutState />
        ) : (
          <>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-sm font-bold">Balance: {amountOfToken1}</span>
              <InputGroup
                ref={token1Ref}
                type="number"
                label="amount of TOKEN1"
                currency="TOKEN1"
                aria-describedby="token1-currency"
              />
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-sm font-bold">Balance: {amountOfToken2}</span>
              <InputGroup
                ref={token2Ref}
                type="number"
                label="amount of TOKEN2"
                currency="TOKEN2"
                aria-describedby="token2-currency"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              className="w-32 flex justify-center items-center px-4 py-2 border bg-slate-800 shadow-sm text-sm font-medium rounded-md text-white  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              onClick={onFund}>
              {isLoading ? <Loader /> : 'Fund'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Faucet;
