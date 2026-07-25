import { Layout } from "@/components/Layout";
import { useSiteContent } from "@/hooks/use-firestore";
import { motion } from "framer-motion";

export default function About() {
  const { content, loading } = useSiteContent();

  if (loading || !content) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-28 pb-16 md:pt-32 md:pb-24">
          <div className="animate-pulse space-y-8">
            <div className="h-12 md:h-16 w-2/3 md:w-1/3 bg-muted rounded" />
            <div className="h-80 md:h-96 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6">About Amit Singh.</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            The technical expertise behind Singh Automobiles Engine Engineering.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-32">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="aspect-[4/3] sm:aspect-[3/4] max-h-[520px] bg-muted rounded-sm overflow-hidden border border-border relative"
              >
                <img 
                  src={content.profileImageUrl || "/assets/amit-singh.jpg"} 
                  alt="Amit Singh" 
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 border-8 md:border-[12px] border-background/20 pointer-events-none" />
              </motion.div>
              
              <div className="mt-6 md:mt-8 space-y-4">
                <div>
                  <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Founder & Lead Engineer</div>
                  <div className="text-xl md:text-2xl font-bold font-sans">Amit Singh</div>
                </div>
                <div className="w-full h-px bg-border" />
                <div>
                  <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Company</div>
                  <div className="text-base md:text-lg font-medium leading-snug">Singh Automobiles Engine Engineering</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 prose prose-lg dark:prose-invert max-w-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-5 md:mb-8">Industrial Experience & Precision</h2>
              
              <div className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed space-y-5 md:space-y-6">
                {content.aboutText.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 not-prose">
                <div className="p-5 md:p-6 bg-card border border-border rounded-sm">
                  <div className="text-2xl md:text-3xl font-mono text-primary font-bold mb-2">10+</div>
                  <div className="font-bold mb-2">Years Experience</div>
                  <p className="text-sm text-muted-foreground">Deep technical knowledge of heavy earth-moving machinery.</p>
                </div>
                
                <div className="p-5 md:p-6 bg-card border border-border rounded-sm">
                  <div className="text-2xl md:text-3xl font-mono text-primary font-bold mb-2">100%</div>
                  <div className="font-bold mb-2">Commitment</div>
                  <p className="text-sm text-muted-foreground">Dedicated to getting your fleet operational with minimal downtime.</p>
                </div>
              </div>

            </motion.div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}
