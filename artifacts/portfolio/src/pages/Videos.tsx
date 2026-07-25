import { Layout } from "@/components/Layout";
import { useVideos } from "@/hooks/use-firestore";
import { Loader2, PlaySquare } from "lucide-react";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Videos() {
  const { videos, loading } = useVideos();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  const pauseOtherVideos = (activeIndex: number) => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== activeIndex) {
        video.pause();
      }
    });
  };

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Videos.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Watch service work, repair updates, and machinery diagnostics from Singh Automobiles.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <div className="border border-dashed border-border bg-card p-10 sm:p-16 text-center rounded-sm">
            <PlaySquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Videos will be available soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {videos.map((video, index) => (
              <motion.article
                key={video.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
                  <video
                    ref={(element) => {
                      videoRefs.current[index] = element;
                    }}
                    src={video.url}
                    controls
                    playsInline
                    preload="metadata"
                    onPlay={() => pauseOtherVideos(index)}
                    className="aspect-[4/3] w-full bg-black object-cover"
                  />
                  {video.title && (
                    <div className="p-4 sm:p-5">
                      <h2 className="text-lg sm:text-xl font-bold leading-snug">{video.title}</h2>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
