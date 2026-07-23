import { Layout } from "@/components/Layout";
import { useSiteContent } from "@/hooks/use-firestore";
import { motion } from "framer-motion";
import { Wrench, Settings, Zap, Compass, Activity, Cog } from "lucide-react";

export default function Services() {
  const { content, loading } = useSiteContent();

  if (loading || !content) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-32 pb-24">
          <div className="animate-pulse space-y-8">
            <div className="h-16 w-1/3 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Map icons to services based on keywords
  const getIconForService = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('electrical')) return <Zap className="w-8 h-8" />;
    if (t.includes('engine')) return <Cog className="w-8 h-8" />;
    if (t.includes('hydraulic')) return <Activity className="w-8 h-8" />;
    if (t.includes('multi-brand')) return <Compass className="w-8 h-8" />;
    return <Settings className="w-8 h-8" />;
  };

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Services.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Comprehensive repair, maintenance, and overhaul for heavy earth-moving machinery. Precision engineering when you need it most.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {content.servicesList.map((service, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="group relative p-10 bg-background border border-border rounded-sm hover:border-primary transition-colors flex gap-6 items-start"
            >
              <div className="bg-primary/10 text-primary p-4 rounded-sm shrink-0">
                {getIconForService(service.title)}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {service.description}
                </p>
                <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-muted text-xs font-mono uppercase tracking-wider rounded-sm text-muted-foreground">Diagnostics</span>
                  <span className="px-3 py-1 bg-muted text-xs font-mono uppercase tracking-wider rounded-sm text-muted-foreground">Repair</span>
                  <span className="px-3 py-1 bg-muted text-xs font-mono uppercase tracking-wider rounded-sm text-muted-foreground">Maintenance</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-12 bg-primary/5 border border-primary/20 rounded-sm text-center">
          <Wrench className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Need Specialized Assistance?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We handle complex faults that standard mechanics can't. Contact us for a technical consultation on your specific machinery issue.
          </p>
          <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 font-medium bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors">
            Contact for Consultation
          </a>
        </div>
      </div>
    </Layout>
  );
}
