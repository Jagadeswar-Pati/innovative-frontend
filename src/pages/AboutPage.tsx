import Layout from '../components/Layout';
import { Target, Lightbulb, Users, Rocket, UserCircle } from 'lucide-react';
import SEO from '@/components/SEO';

const AboutPage = () => {
  return (
    <Layout>
      <SEO
        title="About Innovative Hub — Founder & Vision"
        description="Meet Jagadeswar Pati, founder of Innovative Hub. Engineering-led robotics and IoT store in Bhubaneswar, Odisha — components, kits, and learning for students and makers."
        path="/about"
      />
      <div className="network-bg">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About Innovative Hub</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Odisha&apos;s trusted platform for robotics, IoT, and embedded systems — built by engineers, for
                students, hobbyists, and professionals who want to learn, build, and ship real projects.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <UserCircle className="w-8 h-8 text-primary shrink-0" aria-hidden />
                  Founder
                </h2>
                <p className="text-xl font-semibold text-foreground mb-2">Jagadeswar Pati</p>
                <p className="text-sm font-medium text-primary mb-6">Founder, Innovative Hub</p>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    Jagadeswar Pati is an engineer with a deep focus on robotics, embedded systems, and practical
                    hardware education. He started Innovative Hub to remove friction for anyone learning hands-on
                    electronics — from sourcing reliable components to understanding how things actually work on the
                    bench.
                  </p>
                  <p>
                    His background combines engineering rigour with a maker mindset: fewer buzzwords, more working
                    prototypes, and clear guidance for students navigating microcontrollers, sensors, motor drivers, and
                    IoT builds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-primary shrink-0" aria-hidden />
                  Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Innovative Hub exists to make quality robotics and electronics accessible across Odisha and India — fair
                  pricing, genuine parts, and a path from first LED blink to full project delivery. We believe the next
                  wave of innovation comes from makers who can touch hardware, not only read about it.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Long term, we are building a hub where components, learning content, and community support live
                  together so engineering students and startups can iterate faster with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary shrink-0" aria-hidden />
                  Who We Are
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We are a team of engineers, makers, and educators based in Bhubaneswar. We care about stock accuracy,
                  packaging, and support — because a missing MOSFET or wrong module shouldn&apos;t cost you a semester
                  project deadline.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you are wiring your first Arduino, tuning a drone ESC, or prototyping an IoT gateway, we want
                  Innovative Hub to be the place you trust for parts and honest advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Rocket className="w-8 h-8 text-primary shrink-0" aria-hidden />
                  Our Journey
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  What began as a focused electronics supply effort grew into a full e-commerce and learning-oriented
                  platform — still rooted in the same promise: ship what we would use in our own lab.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today we serve customers across India with expanding categories, tighter quality checks, and the same
                  founder-led attention to how products are described and delivered.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-primary shrink-0" aria-hidden />
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our mission is simple: empower makers, students, and professionals to{' '}
                  <strong className="text-foreground">Learn, Build, Share, and Innovate</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                      Provide high-quality components at competitive prices
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                      Offer clear product information and learning-aligned SKUs
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                      Support innovation through consultation and reliable fulfilment
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-primary mt-1 shrink-0" aria-hidden />
                    <p className="text-sm text-muted-foreground">Grow a community of passionate creators</p>
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
