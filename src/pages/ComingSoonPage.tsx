import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ComingSoonPage = ({ title }: { title: string }) => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center network-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {title}
            </h1>
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
                We are working hard to bring this soon
              </h2>
              <p className="text-muted-foreground text-lg">
                Please check back again.
              </p>
            </div>
            <Link to="/eshop">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90"
              >
                Explore Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoonPage;
