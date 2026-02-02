import { Link } from 'react-router-dom';
import { Clock, Wifi, Lock, MapPin, Phone, BookOpen, Users, Calendar, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-library.jpg';

const features = [
  {
    icon: Clock,
    title: '24/7 Open',
    description: 'Study anytime, day or night. We never close.',
  },
  {
    icon: Lock,
    title: 'Personal Lockers',
    description: 'Secure storage for your books and belongings.',
  },
  {
    icon: Wifi,
    title: 'Dual WiFi',
    description: 'High-speed internet with backup connection.',
  },
  {
    icon: BookOpen,
    title: 'First Digital Library',
    description: 'The first digital library in Mahmudabad.',
  },
];

const stats = [
  { number: '24/7', label: 'Hours Open' },
  { number: '100+', label: 'Study Seats' },
  { number: '500+', label: 'Happy Students' },
  { number: '1st', label: 'Digital Library in MMB' },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">
              Shri Hanumant Library
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <Link to="/login">
              <Button className="btn-hero">
                Login
              </Button>
            </Link>
          </div>
          <Link to="/login" className="md:hidden">
            <Button className="btn-hero">Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4 fill-primary" />
              <span className="text-sm font-medium">First Digital Library in Mahmudabad</span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Gateway to
              <span className="text-gradient block">Academic Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the perfect study environment with 24/7 access, modern amenities, 
              and a peaceful atmosphere designed for focused learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="btn-hero w-full sm:w-auto">
                  Join Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#contact">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Contact Us
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for a productive study session
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-elevated text-center group cursor-pointer"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Space Designed for Success
              </h2>
              <p className="text-muted-foreground mb-6">
                Shri Hanumant Library is more than just a study space. We've created an 
                environment that fosters concentration, creativity, and academic growth. 
                With comfortable seating, excellent lighting, and a quiet atmosphere, 
                you'll find everything you need to excel in your studies.
              </p>
              <ul className="space-y-4">
                {[
                  'Comfortable ergonomic seating',
                  'Air-conditioned environment',
                  'Power outlets at every seat',
                  'Quiet zones for focused study',
                  'Group discussion areas',
                  'Clean drinking water facility',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Library Interior" 
                className="rounded-2xl shadow-strong"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-medium">
                <div className="font-serif text-3xl font-bold">5+ Years</div>
                <div className="text-primary-foreground/80">of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Services
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Individual Study',
                description: 'Personal study desks with comfortable seating and power outlets.',
              },
              {
                icon: Calendar,
                title: 'Flexible Timings',
                description: 'Open 24/7 so you can study whenever suits you best.',
              },
              {
                icon: BookOpen,
                title: 'Digital Resources',
                description: 'Access to digital study materials and high-speed internet.',
              },
            ].map((service, index) => (
              <div key={index} className="stat-card">
                <service.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Visit Us Today
            </h2>
            <p className="text-secondary-foreground/80 max-w-2xl mx-auto">
              We'd love to welcome you to Shri Hanumant Library
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-secondary-foreground/10 p-8 rounded-xl">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Address</h3>
                  <p className="text-secondary-foreground/80">
                    74XH+3HW, Ramuvapur<br />
                    Mahmudabad, Uttar Pradesh 261203
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-secondary-foreground/10 p-8 rounded-xl">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Contact</h3>
                  <p className="text-secondary-foreground/80">
                    +91 79913 04874
                  </p>
                  <a 
                    href="tel:+917991304874" 
                    className="inline-block mt-4 text-primary hover:underline"
                  >
                    Call Now →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-serif font-semibold">Shri Hanumant Library</span>
            </div>
            <p className="text-background/60 text-sm">
              © {new Date().getFullYear()} Shri Hanumant Library. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
