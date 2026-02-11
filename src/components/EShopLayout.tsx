import { ReactNode } from 'react';
import EShopHeader from './EShopHeader';
import Footer from './Footer';

interface EShopLayoutProps {
  children: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const EShopLayout = ({ children, searchQuery, onSearchChange }: EShopLayoutProps) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background overflow-x-hidden">
      <EShopHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="flex-1 flex flex-col w-full max-w-full pt-28 sm:pt-32 lg:pt-40">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EShopLayout;
