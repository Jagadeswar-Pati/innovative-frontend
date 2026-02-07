import Layout from '../components/Layout';
import { Target, Lightbulb, Users, Rocket } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout>
      <div className="network-bg">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About Us
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to Innovative Hub – your one-stop destination for electronics, robotics, and DIY innovation.
              </p>
            </div>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  Who We Are
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Innovative Hub is a passionate team of engineers, makers, and educators dedicated to making technology accessible to everyone. We believe that the future belongs to those who create, and we're here to provide you with the tools, knowledge, and support you need to turn your ideas into reality.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're a student starting your first electronics project, a hobbyist exploring robotics, or a professional building the next big thing – we've got you covered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Journey */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Rocket className="w-8 h-8 text-primary" />
                  Our Journey
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Founded with a vision to bridge the gap between ideas and execution, Innovative Hub started as a small electronics shop. Over the years, we've grown into a comprehensive platform offering components, courses, project kits, and a vibrant community of innovators.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Our journey has been fueled by our commitment to quality, affordability, and customer satisfaction. Today, we serve thousands of customers across the country, helping them bring their creative visions to life.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="py-12 md:py-16 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary" />
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our mission is simple: to empower makers, students, and professionals to <strong className="text-foreground">Learn, Build, Share, and Innovate</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Provide high-quality components at competitive prices
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Offer comprehensive learning resources and tutorials
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Support innovation through expert consultation
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Build a community of passionate creators
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
