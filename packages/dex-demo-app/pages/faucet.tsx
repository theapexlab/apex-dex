import type { NextPage } from 'next';

import { useState } from 'react';
import { InputGroup } from '../components/inputGroup';
import { Layout } from '../components/layout';
import { useAccount } from '../hooks/useAccount';
import { useMetamask } from '../hooks/useMetamask';
import { PRECISION } from '../utils/config';

const Faucet: NextPage = () => {
  const contract = null;
  const { accounts } = useMetamask();
  const { getHoldings } = useAccount({ contract });

  //const [amountOfToken1, setAmountOfToken1] = useState(0);
  //const [amountOfToken2, setAmountOfToken2] = useState(0);

  console.log('address', accounts);

  const onFund = async () => {
    if (contract === null) {
      alert('Connect to Metamask');
      return;
    }

    try {
      /*    let response = await contract.faucet(amountOfToken1 * PRECISION, amountOfToken2 * PRECISION);
      let res = await response.wait();
      console.log('res', res);
      setAmountOfToken1(0);
      setAmountOfToken2(0);
      await getHoldings();*/
    } catch (err) {
      if ((err as any).data) {
        alert((err as any).data?.message);
      }

      console.log(err);
    }
  };

  return (
    <Layout title="Faucet" description="Faucet page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Faucet</h1>
      </div>

      <div className="flex flex-col items-center py-8 space-y-8">
        <InputGroup type="number" label="amount of TOKEN1" currency="TOKEN1" aria-describedby="token1-currency" />
        <InputGroup type="number" label="amount of TOKEN2" currency="TOKEN2" aria-describedby="token2-currency" />

        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border  bg-slate-800 shadow-sm text-sm font-medium rounded-md text-white  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          onClick={onFund}>
          Fund
        </button>
      </div>
    </Layout>
  );
};

export default Faucet;
