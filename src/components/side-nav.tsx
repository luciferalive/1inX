import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "motion/react";
import {
  Menu, X, Home, Brain, User, BarChart3, Trophy, Search, Drama,
  Gift, Gem, Award, Heart, Settings, HelpCircle, LogOut, Sparkles,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: any;
  params?: Record<string, string>;
  authOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/assessment", label: "Take Test", icon: Brain },
  { to: "/results", label: "My Results", icon: BarChart3, authOnly: true },
  { to: "/leaderboard", label: "Leaderboards", icon: Trophy },
  { to: "/discover", label: "Discover Users", icon: Search },
  { to: "/archetypes", label: "Archetypes", icon: Drama },
  { to: "/referrals", label: "Referrals", icon: Gift, authOnly: true },
  { to: "/plans", label: "Plans & Pricing", icon: Gem },
  { to: "/achievements", label: "Achievements", icon: Award, authOnly: true },
  { to: "/saved", label: "Saved Comparisons", icon: Heart, authOnly: true },
  { to: "/settings", label: "Settings", icon: Settings, authOnly: true },
  { to: "/help", label: "Help & FAQ", icon: HelpCircle },
];

export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      className="grid h-9 w-9 place-items-center rounded-xl glass transition hover:scale-[1.05]"
    >
      <Menu className="h-4 w-4" />
    </button>
  );
}

export function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, profile, signOut } = useAuth();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const items = NAV.filter((n) => !n.authOnly || user);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-md"
          />
          <motion.aside
            key="panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col overflow-hidden border-r border-white/10 bg-[oklch(0.15_0.04_285)] shadow-2xl"
          >
            <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-violet/30 blur-[100px]" />
            <div className="absolute -bottom-32 -right-20 h-72 w-72 rounded-full bg-magenta/25 blur-[120px]" />

            <div className="relative flex items-center justify-between px-5 py-4">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-cosmic shadow-glow">
                  <span className="font-display text-sm font-bold text-white">1</span>
                </div>
                <span className="font-display text-base font-semibold">
                  in <span className="text-gradient-cosmic">X</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-8 w-8 place-items-center rounded-lg glass"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {user && (
              <div className="relative mx-4 mb-4 rounded-2xl glass-strong p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-violet-magenta text-base font-semibold text-white">
                    {(profile?.username ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">@{profile?.username ?? "you"}</div>
                    <div className="truncate text-[11px] uppercase tracking-wider text-gold">
                      {profile?.tier ?? "free"} plan
                    </div>
                  </div>
                </div>
                {profile && (
                  <Link
                    to="/u/$username"
                    params={{ username: profile.username }}
                    onClick={onClose}
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-xs text-foreground/80 hover:bg-white/10"
                  >
                    <User className="h-3.5 w-3.5" /> View public profile
                  </Link>
                )}
              </div>
            )}

            {!user && (
              <div className="relative mx-4 mb-4 rounded-2xl bg-gradient-violet-magenta p-4 text-white">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4" /> Reveal your rarity
                </div>
                <p className="mt-1 text-xs text-white/85">Free in 3 minutes.</p>
                <Link
                  to="/assessment"
                  onClick={onClose}
                  className="mt-3 inline-block rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-zinc-900"
                >
                  Start free →
                </Link>
              </div>
            )}

            <nav className="relative flex-1 overflow-y-auto px-3 pb-6">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to as any}
                      params={item.params as any}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/85 transition hover:bg-white/5"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
                {user && (
                  <li>
                    <button
                      onClick={async () => { onClose(); await signOut(); }}
                      className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </li>
                )}
              </ul>
            </nav>

            <div className="relative border-t border-white/10 px-5 py-3 text-[11px] text-muted-foreground">
              1 in X · v1.0 · The Human Rarity Index
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
