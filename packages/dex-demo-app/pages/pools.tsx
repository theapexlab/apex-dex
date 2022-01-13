import type { NextPage } from 'next';
import Head from 'next/head';
import { Layout } from '../components/layout';

const Pools: NextPage = () => {
  return (
    <Layout title="Pools" description="Pools page">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Available pools</h1>
      </div>
    </Layout>
  );
};

export default Pools;
