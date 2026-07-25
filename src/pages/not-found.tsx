import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-primary/10 text-primary p-4 rounded-full mb-6">
          <Wrench size={48} className="stroke-[2]" />
        </div>
        <h1 className="text-6xl font-bold tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The page you are looking for doesn't exist or has been moved. Let's get you back to the workshop.
        </p>
        <Button asChild size="lg">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </Layout>
  );
}
