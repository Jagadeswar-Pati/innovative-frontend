import { Link } from 'react-router-dom';
import { Zap, MonitorPlay, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const offerings = [
  {
    icon: Zap,
    title: 'E-Shop for Components',
    description: 'Explore a vast catalog of high-quality electrical and electronic components for your projects.',
    path: '/eshop',
    active: true,
    hoverColor: 'hover:border-green-500',
  },
  {
    icon: MonitorPlay,
    title: 'Robotics Courses & Tutorials',
    description: 'Learn robotics from the ground up with our comprehensive video courses and step-by-step guides.',
    path: '/robotics-courses',
    active: false,
    hoverColor: 'hover:border-primary',
  },
  {
    icon: Settings,
    title: 'Project Kits & Consultation',
    description: 'Get everything you need in one kit. We also offer expert consultation for your custom projects.',
    path: '/project-kits',
    active: false,
    hoverColor: 'hover:border-primary',
  },
  {
    icon: MessageCircle,
    title: 'Resource and Ideas Hub',
    description: 'A knowledge-sharing hub filled with innovative ideas, project inspirations, research insights, and community discussions to spark creativity.',
    path: '/resources',
    active: false,
    hoverColor: 'hover:border-primary',
  },
];

const HomePage = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Video Background - covers entire section */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center container mx-auto px-4 text-center py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in italic">
          Innovative Hub
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in px-4" style={{ animationDelay: '0.2s' }}>
          Your all-in-one destination for electronics, robotics, and creative innovation. We provide the tools, knowledge, and community you need to bring your ideas to life.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/eshop">
            <Button 
              size="lg" 
              className="px-10 py-6 text-base md:text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explore Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Core Offerings - within the same video background */}
      <div className="relative z-10 container mx-auto px-4 pb-16 md:pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">
          Our Core Offerings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {offerings.map((offering) => (
            <Link
              key={offering.title}
              to={offering.path}
              className="group block"
            >
              <div className={`h-full bg-[#1a2332]/80 backdrop-blur-sm border-2 border-transparent rounded-xl p-6 transition-all duration-300 ${offering.hoverColor} hover:bg-[#1a2332]`}>
                <div className="flex flex-col items-center text-center h-full">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <offering.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {offering.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed flex-1">
                    {offering.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
