import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { HamburgerButton, SideNav } from "@/components/side-nav";

export function SiteHeader() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-cosmic shadow-glow">
            <span className="font-display text-lg font-bold text-white">1</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            in <span className="text-gradient-cosmic">X</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link to="/discover" className="hidden text-muted-foreground hover:text-foreground sm:block">Discover</Link>
          <Link to="/leaderboard" className="hidden text-muted-foreground hover:text-foreground sm:block">Leaderboard</Link>
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full glass px-2 py-1.5 pr-3"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-violet-magenta text-xs font-semibold text-white">
                  {(profile?.username ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden text-xs sm:inline">@{profile?.username ?? "you"}</span>
              </button>
              {open && (
                <div
                  onMouseLeave={() => setOpen(false)}
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl glass-strong p-1.5 text-sm shadow-card"
                >
                  {profile && (
                    <Link
                      to="/u/$username"
                      params={{ username: profile.username }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5"
                    >
                      <User className="h-4 w-4" /> My profile
                    </Link>
                  )}
                  <Link to="/results" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5">
                    My results
                  </Link>
                  <Link to="/referrals" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5">
                    Referrals
                  </Link>
                  <button
                    onClick={async () => { setOpen(false); await signOut(); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-muted-foreground hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-muted-foreground hover:text-foreground">Sign in</Link>
              <Link
                to="/assessment"
                className="rounded-full bg-gradient-violet-magenta px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:scale-[1.03]"
              >
                Start Free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function CosmicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-violet/30 blur-[120px] animate-float-orb" />
      <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-magenta/25 blur-[140px] animate-float-orb" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-gold/15 blur-[160px] animate-float-orb" style={{ animationDelay: "6s" }} />
    </div>
  );
}
