import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useSiteContent } from "@/hooks/use-firestore";
import { motion } from "framer-motion";

export default function Home() {
  const { content } = useSiteContent();

  const heroImage = content?.heroImageUrl || "/assets/hero.jpg";
  const heroName = "Amit Singh";
  const heroTitle = "Automobile Engineer";
  const heroSubtitle =
    "Heavy machinery electrical, engine, hydraulic and earth moving machinery service.";

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/80 dark:bg-background/90 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <img
            src={heroImage}
            alt="Heavy Earth Moving Machinery"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-20 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-mono text-sm uppercase tracking-wider">
              <Zap size={14} className="fill-primary" />
              <span>{heroName}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              {heroTitle}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed border-l-2 border-primary pl-4">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-base rounded-sm font-semibold tracking-wide">
                <Link href="/services">
                  View Services <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base rounded-sm border-2">
                <Link href="/contact">Get a Quote</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Trust Bar */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12">
          <div className="grid grid-cols-2 max-w-5xl mx-auto divide-x divide-border">
            {[
              { label: "Years Experience", value: "10+" },
              { label: "Brands Serviced", value: "15+" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-4 md:px-8">
                <div className="text-4xl md:text-5xl font-bold font-mono text-primary mb-3 leading-none">{stat.value}</div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Overview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Core Expertise</h2>
              <p className="text-muted-foreground text-lg">We deliver industrial-grade solutions across all critical machinery systems.</p>
            </div>
            <Button asChild variant="ghost" className="shrink-0">
              <Link href="/services">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.servicesList.slice(0, 4).map((service, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="group relative p-8 bg-card border border-border rounded-sm hover:border-primary/50 transition-colors overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-300 ease-out" />
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Engineered for Reliability</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                When a 50-tonne machine goes down, you don't need promises—you need technical precision. We bring authorized-level expertise directly to your equipment.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Diagnostic mastery for complex electrical faults",
                  "Genuine parts recommendations and sourcing advice",
                  "Rapid response to minimize costly downtime",
                  "Preventative maintenance strategies"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-primary/20 text-primary p-1 rounded-full">
                      <CheckCircle2 size={18} />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-muted rounded-sm overflow-hidden border border-border relative">
                <img 
                  src={content.engineImageUrl || "/assets/services.jpg"} 
                  alt="Engine repair"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-8 border-background/20" />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-background border border-border p-6 rounded-sm shadow-xl max-w-xs hidden md:block">
                <ShieldCheck className="text-primary h-10 w-10 mb-4" />
                <p className="font-bold text-lg mb-1">Quality Guaranteed</p>
                <p className="text-sm text-muted-foreground">Every repair meets stringent industrial standards.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Marquee */}
      <section className="py-12 bg-background border-t border-border overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Authorized-Level Expertise For</p>
        </div>
        <div className="flex space-x-16 animate-[marquee_20s_linear_infinite] whitespace-nowrap opacity-50 hover:opacity-100 transition-opacity">
          {["VOLVO", "HYUNDAI", "CAT", "L&T", "KOMATSU", "SANY", "JCB", "TATA HITACHI", "KOBELCO"].map((brand, i) => (
            <span key={i} className="text-4xl md:text-5xl font-bold font-sans tracking-tighter mx-8 text-foreground/80">
              {brand}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {["VOLVO", "HYUNDAI", "CAT", "L&T", "KOMATSU", "SANY", "JCB", "TATA HITACHI", "KOBELCO"].map((brand, i) => (
            <span key={`dup-${i}`} className="text-4xl md:text-5xl font-bold font-sans tracking-tighter mx-8 text-foreground/80">
              {brand}
            </span>
          ))}
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </Layout>
  );
}
