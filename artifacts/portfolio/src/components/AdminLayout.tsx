import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./theme-toggle";
import { 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  Star,
  Send,
  LogOut,
  Wrench,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If not logged in, we shouldn't render this layout (handled by AuthGuard)
  if (!user) return null;

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Content", icon: FileText },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/mail", label: "Mail", icon: Send },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-sm">
            <Wrench size={20} className="stroke-[2.5]" />
          </div>
          <span className="font-bold tracking-tight font-sans text-foreground">
            ADMIN
          </span>
        </Link>
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {user.email}
        </p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/95 backdrop-blur z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-sm">
            <Wrench size={18} />
          </div>
          <span className="font-bold font-sans">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-sm border border-border bg-background"
          aria-label="Open admin menu"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-sm border border-border text-muted-foreground"
                aria-label="Close admin menu"
              >
                <X size={20} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
