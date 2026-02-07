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
    <div className="min-h-screen flex flex-col bg-background">
      <EShopHeader searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="flex-1 pt-32 lg:pt-40">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default EShopLayout;
