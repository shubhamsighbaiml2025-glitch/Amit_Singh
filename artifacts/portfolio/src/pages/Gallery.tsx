import { Layout } from "@/components/Layout";
import { useGallery } from "@/hooks/use-firestore";
import { motion } from "framer-motion";

export default function Gallery() {
  const { images, loading } = useGallery();

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6">Gallery.</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Our work in the field. Heavy machinery repair, maintenance, and complex diagnostics in action.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-[4/3] sm:aspect-square bg-muted rounded-sm" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 md:py-24 px-4 border border-dashed border-border rounded-sm">
            <p className="text-muted-foreground font-mono">No images in gallery yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {images.map((img, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={img.id}
                className="group relative aspect-[4/3] sm:aspect-square overflow-hidden bg-muted border border-border rounded-sm"
              >
                <img 
                  src={img.url} 
                  alt={img.caption || "Gallery image"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 to-transparent sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium leading-snug line-clamp-2">{img.caption}</p>
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
