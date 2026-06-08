import { Link } from "@tanstack/react-router";

export function SiteHeader() {
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
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            to="/assessment"
            className="rounded-full bg-gradient-violet-magenta px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:scale-[1.03]"
          >
            Start Free
          </Link>
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
