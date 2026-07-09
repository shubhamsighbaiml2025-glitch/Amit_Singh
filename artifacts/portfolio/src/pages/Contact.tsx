import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    };

    const phoneDigits = data.phone.replace(/\D/g, "");

    if (!data.name || !data.email || !data.message || !data.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (phoneDigits.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/send-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, phone: phoneDigits }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Enquiry saved, but email could not be sent");
      }

      toast.success("Thank you! Your enquiry has been submitted.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-card border-b border-border pt-32 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Contact.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Get in touch for specialized machinery repair, service quotes, or technical consultation.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl font-bold mb-8">Send an Enquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name *</label>
                <Input id="name" name="name" required className="bg-background h-12" placeholder="John Doe" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email *</label>
                  <Input id="email" name="email" type="email" required className="bg-background h-12" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone *</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    className="bg-background h-12"
                    placeholder="10 digit phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message *</label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  className="bg-background min-h-[150px] resize-y"
                  placeholder="Describe your machinery issue or service requirement..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold">
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                ) : (
                  "Submit Enquiry"
                )}
              </Button>
            </form>
          </div>

          <div className="lg:pl-12">
            <div className="bg-muted/50 border border-border p-8 rounded-sm">
              <h2 className="text-2xl font-bold mb-8">Direct Contact</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Phone</div>
                    <div className="text-lg font-medium">+91 9905804791</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Email</div>
                    <div className="text-lg font-medium break-all">amitsingh6061.innet@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/20 p-3 rounded-full shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-1">Location</div>
                    <div className="text-lg font-medium">India</div>
                    <p className="text-muted-foreground mt-2">Available for on-site service calls across designated regions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
