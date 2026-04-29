import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cadenceHealth, tierDotClass } from "@/lib/cadence";
import { Plus, ArrowRight, Bell, Sparkles, Phone, Coffee } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Today — Kinship" }] }),
  component: Dashboard,
});

type Contact = {
  id: string;
  name: string;
  avatar_url: string | null;
  last_contacted_at: string | null;
  tier_id: string | null;
  email: string | null;
};
type Tier = { id: string; name: string; color: string; cadence_days: number };
type Interaction = { id: string; type: string; occurred_at: string; notes: string | null; contact: { id: string; name: string } | null };
type Reminder = { id: string; due_at: string; message: string | null; status: string; contact: { id: string; name: string } | null };

function Dashboard() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [t, c, i, r] = await Promise.all([
        supabase.from("tiers").select("*").order("sort_order"),
        supabase.from("contacts").select("*").order("name"),
        supabase.from("interactions").select("*, contact:contacts(id,name)").order("occurred_at", { ascending: false }).limit(5),
        supabase.from("reminders").select("*, contact:contacts(id,name)").eq("status", "pending").order("due_at").limit(5),
      ]);
      setTiers(t.data ?? []);
      setContacts(c.data ?? []);
      setInteractions((i.data as any) ?? []);
      setReminders((r.data as any) ?? []);
      setLoading(false);
    })();
  }, [user]);

  // Compute nudges: contacts overdue based on tier cadence
  const tierMap = Object.fromEntries(tiers.map((t) => [t.id, t]));
  const nudges = contacts
    .map((c) => {
      const tier = c.tier_id ? tierMap[c.tier_id] : null;
      const cadence = tier?.cadence_days ?? 60;
      const h = cadenceHealth(c.last_contacted_at, cadence);
      return { contact: c, tier, health: h };
    })
    .filter((n) => n.health.status === "overdue" || n.health.status === "due-soon" || n.health.status === "new")
    .sort((a, b) => b.health.ratio - a.health.ratio)
    .slice(0, 5);

  const tierCounts = tiers.map((t) => ({
    ...t,
    count: contacts.filter((c) => c.tier_id === t.id).length,
  }));

  const logInteraction = async (contactId: string, type: string) => {
    if (!user) return;
    const { error } = await supabase.from("interactions").insert({
      user_id: user.id,
      contact_id: contactId,
      type,
      occurred_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    await supabase.from("contacts").update({ last_contacted_at: new Date().toISOString() }).eq("id", contactId);
    toast.success("Logged");
    setContacts((cs) => cs.map((c) => (c.id === contactId ? { ...c, last_contacted_at: new Date().toISOString() } : c)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="display text-4xl md:text-5xl">
            Today's <span className="display-italic">circle</span>
          </h1>
        </div>
        <Link to="/app/contacts" className="hidden md:inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Add person
        </Link>
      </div>

      {loading ? (
        <div className="serif italic text-muted-foreground">Gathering your people…</div>
      ) : contacts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-min">
          {/* Nudges - large */}
          <div className="bento bento-lift md:col-span-4 md:row-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="serif text-2xl">Gentle nudges</h2>
              </div>
              <span className="text-xs text-muted-foreground">{nudges.length} waiting</span>
            </div>
            {nudges.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">You're all caught up. Beautiful.</p>
            ) : (
              <ul className="divide-y divide-border">
                {nudges.map(({ contact, tier, health }) => (
                  <li key={contact.id} className="py-3 flex items-center gap-4">
                    <Avatar name={contact.name} url={contact.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <Link to="/app/contacts/$id" params={{ id: contact.id }} className="font-medium truncate block hover:underline">
                        {contact.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {tier && <><span className={`h-1.5 w-1.5 rounded-full ${tierDotClass[tier.color] ?? "bg-sage"}`} />{tier.name}</>}
                        <span>·</span>
                        <span>
                          {health.status === "new" ? "Never reached out" :
                           health.status === "overdue" ? `${health.overdueDays}d overdue` : "due soon"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => logInteraction(contact.id, "call")} title="Logged a call" className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button onClick={() => logInteraction(contact.id, "lunch")} title="Met in person" className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition">
                        <Coffee className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reminders */}
          <div className="bento md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="serif text-xl">Upcoming</h2>
            </div>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reminders scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {reminders.map((r) => (
                  <li key={r.id} className="text-sm">
                    <div className="font-medium">{r.contact?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.due_at).toLocaleDateString("en", { month: "short", day: "numeric" })} · {r.message || "Reach out"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tier overview */}
          <div className="bento md:col-span-2">
            <h2 className="serif text-xl mb-3">Your circles</h2>
            <ul className="space-y-2">
              {tierCounts.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${tierDotClass[t.color] ?? "bg-sage"}`} />
                    {t.name}
                  </span>
                  <span className="text-muted-foreground">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent moments */}
          <div className="bento md:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="serif text-xl">Recent moments</h2>
              <Link to="/app/contacts" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                All people <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interactions logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {interactions.map((i) => (
                  <li key={i.id} className="flex items-start gap-3 text-sm">
                    <span className="serif italic text-muted-foreground w-16 shrink-0 text-xs pt-0.5">
                      {new Date(i.occurred_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{i.contact?.name}</span>
                      <span className="text-muted-foreground"> · {i.type}</span>
                      {i.notes && <p className="text-muted-foreground text-xs mt-0.5">{i.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Link to="/app/contacts" className="md:hidden fixed bottom-20 right-4 rounded-full bg-primary p-4 shadow-lift">
        <Plus className="h-5 w-5 text-primary-foreground" />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bento bento-lift text-center py-16">
      <h2 className="display text-3xl mb-3">Welcome to your <span className="display-italic">circle</span></h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start by adding the people you want to stay close to. Family, mentors, friends from college, that one collaborator who just gets you.
      </p>
      <Link to="/app/contacts" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
        <Plus className="h-4 w-4" /> Add your first person
      </Link>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
      {url ? <img src={url} alt={name} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}
