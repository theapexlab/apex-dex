import type { NextPage } from 'next';
import { Layout } from '../components/layout';

const Home: NextPage = () => {
  return (
    <Layout title="Home" description="Home page">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to the DEX demo app!</h1>
      </div>
    </Layout>
  );
};

export default Home;
