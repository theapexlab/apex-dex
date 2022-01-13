import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ContractProvider } from '../context/contractProvider';
import { AuthProvider } from '../context/auth/context';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ContractProvider>
        <Component {...pageProps} />
      </ContractProvider>
    </AuthProvider>
  );
}

export default MyApp;
