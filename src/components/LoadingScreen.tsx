import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  // ⏱️ LOADING DURATION: Change this value (in milliseconds) to adjust loading time
  // 2000 = 2 seconds, 3000 = 3 seconds, etc.
  const LOADING_DURATION = 2000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onLoadingComplete, 300); // Fade out transition
    }, LOADING_DURATION);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        
        {/* Animated glow circles - responsive sizes */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-primary/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-primary/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Centered Logo Container - NO DELAY, appears instantly */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Logo with animation - starts immediately */}
        <div className="animate-fade-scale-in" style={{ animationDelay: '0s' }}>
          <div className="relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 animate-logo-glow" />
            
            {/* Logo image with circular mask - responsive sizes */}
            <div className="relative animate-logo-pulse">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-background/80 backdrop-blur-sm border-2 border-primary/30 shadow-xl flex items-center justify-center">
                <img 
                  src="/assets/logo.png" 
                  alt="Innovative Hub Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Brand name - responsive text */}
        <h1 className="mt-4 sm:mt-5 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          Innovative Hub
        </h1>

        {/* Loading indicator - responsive spacing */}
        <div className="mt-4 sm:mt-6 flex items-center gap-1 sm:gap-1.5">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
