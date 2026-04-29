import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, signOut } from "@/lib/auth";
import { Home, Users, Layers, Settings, LogOut } from "lucide-react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Your circle — Kinship" },
      { name: "description", content: "Your personal CRM dashboard." },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="serif italic text-muted-foreground">Loading your circle…</div>
      </div>
    );
  }

  const navItems = [
    { to: "/app", label: "Today", icon: Home, exact: true },
    { to: "/app/contacts", label: "People", icon: Users },
    { to: "/app/tiers", label: "Tiers", icon: Layers },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background grain">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
        <header className="flex items-center justify-between mb-6">
          <Link to="/app" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="serif text-xl tracking-tight">Kinship</span>
          </Link>
          <button
            onClick={signOut}
            className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <div className="md:grid md:grid-cols-[200px_1fr] md:gap-8">
          <aside className="hidden md:block">
            <nav className="sticky top-6 space-y-1">
              {navItems.map((it) => {
                const active = it.exact ? location.pathname === it.to : location.pathname.startsWith(it.to);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="pb-24 md:pb-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-40">
          <div className="flex justify-around items-center py-2 px-2">
            {navItems.map((it) => {
              const active = it.exact ? location.pathname === it.to : location.pathname.startsWith(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <it.icon className="h-5 w-5" />
                  {it.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
