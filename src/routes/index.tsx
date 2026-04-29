import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Sparkles, Heart, Calendar, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kinship — A personal CRM for the people who matter" },
      { name: "description", content: "Nurture friendships and professional connections with gentle nudges, interaction logs, and contact tiers. Built for people, not deals." },
      { property: "og:title", content: "Kinship — A personal CRM" },
      { property: "og:description", content: "Nurture friendships and professional connections with gentle nudges." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background grain">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="serif text-xl tracking-tight">Kinship</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth" className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">Sign in</Link>
          <Link to="/auth" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">Get started</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-6">A personal CRM</p>
            <h1 className="display text-[clamp(3rem,7vw,5.5rem)] text-foreground mb-6">
              Tend to the
              <br />
              <span className="display-italic">relationships</span>
              <br />
              that hold you up.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
              Kinship is a quiet companion for staying close to the people who matter — friends, family, mentors, collaborators. No pipelines. No funnels. Just kinship.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/auth" className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                Start your circle
              </Link>
              <Link to="/auth" className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-secondary">
                See a demo
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="A constellation of warm dots connected by delicate lines"
              width={1280}
              height={1280}
              className="w-full rounded-3xl"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bento">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center mb-4">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="serif text-xl mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-32 text-center">
        <h2 className="display text-4xl md:text-5xl mb-6">
          Closeness, <span className="display-italic">cultivated</span>.
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Add anyone you care about, sort them into tiers with gentle check-in cadences, log the lunches and late-night calls, and let Kinship whisper when it's time to reach out again.
        </p>
        <Link to="/auth" className="inline-flex rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          Begin
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>© Kinship</span>
          <span className="serif italic">Made with care</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: Heart, title: "Tiers of closeness", body: "Inner circle, family, professional. Each with its own rhythm of staying in touch." },
  { icon: Sparkles, title: "Gentle nudges", body: "We surface who you've been meaning to reach out to — without guilt." },
  { icon: MessageCircle, title: "A timeline of moments", body: "Log every coffee, call, and text. Build a memory of the relationship." },
  { icon: Calendar, title: "Calendar & inbox", body: "Connect Gmail and Google Calendar to bring everything into one quiet view." },
];
