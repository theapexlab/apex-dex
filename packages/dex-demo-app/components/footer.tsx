import Image from 'next/image';

export const Footer = () => (
  <footer className="flex h-8 py-8 justify-center items-center border-t-2">
    <a
      href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
      target="_blank"
      className="flex items-center justify-center"
      rel="noopener noreferrer">
      Powered by{' '}
      <span className="flex items-center h-8 ml-1">
        <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
      </span>
    </a>
  </footer>
);
