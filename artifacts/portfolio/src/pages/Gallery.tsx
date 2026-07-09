import { Layout } from "@/components/Layout";
import { useGallery } from "@/hooks/use-firestore";
import { motion } from "framer-motion";

export default function Gallery() {
  const { images, loading } = useGallery();

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Gallery.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Our work in the field. Heavy machinery repair, maintenance, and complex diagnostics in action.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-muted rounded-sm" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border rounded-sm">
            <p className="text-muted-foreground font-mono">No images in gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={img.id}
                className="group relative aspect-square overflow-hidden bg-muted border border-border rounded-sm"
              >
                <img 
                  src={img.url} 
                  alt={img.caption || "Gallery image"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium">{img.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
