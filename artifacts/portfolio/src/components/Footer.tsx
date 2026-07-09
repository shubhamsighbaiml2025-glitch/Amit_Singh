import { Link } from "wouter";
import { Wrench, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-sm">
                <Wrench size={20} className="stroke-[2.5]" />
              </div>
              <span className="font-bold text-lg tracking-tight font-sans">
                SINGH AUTOMOBILES
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Heavy earth-moving machinery and automobile electrical specialist based in India. Precision engineering and unyielding power.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 font-mono text-sm tracking-wider uppercase text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Heavy Machinery Electricals</li>
              <li>Diesel Engine Service</li>
              <li>Hydraulic Pump Service</li>
              <li>Control Valve Repair</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 font-mono text-sm tracking-wider uppercase text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Our Services</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 font-mono text-sm tracking-wider uppercase text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-primary shrink-0 mt-0.5" />
                <span>+91 9905804791</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                <span className="break-all">amitsingh6061.innet@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
          <p>© {new Date().getFullYear()} Singh Automobiles Engine Engineering. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://asrvtech.in" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              Built by asrvtech.in
            </a>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
