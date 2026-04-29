import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Mail, Calendar, Instagram, Linkedin, Twitter, Music2 } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Kinship" }] }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();

  const integrations = [
    { name: "Gmail", icon: Mail, status: "available", desc: "See recent emails per contact in their content hub." },
    { name: "Google Calendar", icon: Calendar, status: "available", desc: "Schedule reminders and meetups directly from a contact." },
    { name: "Instagram", icon: Instagram, status: "coming-soon", desc: "Pull recent posts and stories into the content hub." },
    { name: "LinkedIn", icon: Linkedin, status: "coming-soon", desc: "Track professional updates and job changes." },
    { name: "X", icon: Twitter, status: "coming-soon", desc: "See recent posts and replies." },
    { name: "TikTok", icon: Music2, status: "coming-soon", desc: "Catch their latest videos." },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-4xl md:text-5xl">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect the channels you already use to bring your circle into one quiet place.</p>
      </div>

      <section>
        <h2 className="serif text-2xl mb-4">Account</h2>
        <div className="bento">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Signed in as</div>
          <div className="font-medium">{user?.email}</div>
        </div>
      </section>

      <section>
        <h2 className="serif text-2xl mb-4">Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrations.map((it) => (
            <div key={it.name} className="bento flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{it.name}</span>
                  {it.status === "coming-soon" && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Coming soon</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{it.desc}</p>
                <button
                  disabled={it.status === "coming-soon"}
                  className="rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {it.status === "coming-soon" ? "Coming soon" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 italic serif">
          Note: Gmail and Google Calendar will connect via Lovable's connectors. Instagram, LinkedIn, X, and TikTok require their own developer apps — we'll wire them up in a future update.
        </p>
      </section>
    </div>
  );
}
