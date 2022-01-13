import { FC } from 'react';
import { useAuthContext } from '../context/auth/context';

export const LoggedOutState: FC = () => {
  const { connectWallet } = useAuthContext();

  return (
    <div className="flex flex-col justify-center items-center">
      <span className="text-2xl font-bold py-8">To use this feature you need to connect your Metamask wallet!</span>
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        onClick={connectWallet}>
        Connect Metamask
      </button>
    </div>
  );
};
