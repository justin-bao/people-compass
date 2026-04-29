import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cadenceHealth, tierDotClass } from "@/lib/cadence";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/contacts/")({
  head: () => ({ meta: [{ title: "People — Kinship" }] }),
  component: Contacts,
});

type Tier = { id: string; name: string; color: string; cadence_days: number };
type Contact = {
  id: string; name: string; avatar_url: string | null; tier_id: string | null;
  last_contacted_at: string | null; role: string | null; company: string | null;
};

function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const [c, t] = await Promise.all([
      supabase.from("contacts").select("*").order("name"),
      supabase.from("tiers").select("*").order("sort_order"),
    ]);
    setContacts(c.data ?? []);
    setTiers(t.data ?? []);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const tierMap = Object.fromEntries(tiers.map((t) => [t.id, t]));

  const filtered = contacts
    .filter((c) => filter === "all" || c.tier_id === filter)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="display text-4xl md:text-5xl">Your <span className="display-italic">people</span></h1>
          <p className="text-sm text-muted-foreground mt-1">{contacts.length} in your circle</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> Add person
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button onClick={() => setFilter("all")} className={`rounded-full px-3 py-1.5 text-xs transition ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
          All
        </button>
        {tiers.map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)} className={`rounded-full px-3 py-1.5 text-xs transition flex items-center gap-1.5 ${filter === t.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tierDotClass[t.color] ?? "bg-sage"}`} />
            {t.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bento text-center py-12">
          <p className="text-muted-foreground">No one here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const tier = c.tier_id ? tierMap[c.tier_id] : null;
            const h = cadenceHealth(c.last_contacted_at, tier?.cadence_days ?? 60);
            return (
              <Link key={c.id} to="/app/contacts/$id" params={{ id: c.id }} className="bento group">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-base font-medium shrink-0 overflow-hidden">
                    {c.avatar_url ? <img src={c.avatar_url} alt={c.name} className="h-full w-full object-cover" /> : c.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.role && c.company ? `${c.role} · ${c.company}` : c.role || c.company || (tier?.name ?? "—")}
                    </div>
                  </div>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${
                    h.status === "fresh" ? "bg-[oklch(0.572_0.058_145)]" :
                    h.status === "due-soon" ? "bg-[oklch(0.785_0.043_140)]" :
                    h.status === "overdue" ? "bg-[oklch(0.660_0.090_50)]" : "bg-muted-foreground/40"
                  }`} title={h.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {adding && <AddContactModal tiers={tiers} onClose={() => setAdding(false)} onAdded={load} />}
    </div>
  );
}

function AddContactModal({ tiers, onClose, onAdded }: { tiers: Tier[]; onClose: () => void; onAdded: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [tierId, setTierId] = useState(tiers[2]?.id ?? tiers[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("contacts").insert({
      user_id: user.id,
      name: name.trim(),
      tier_id: tierId || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      role: role.trim() || null,
      company: company.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`${name} added to your circle`);
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-3xl border border-border w-full max-w-md p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="serif text-2xl">Add a person</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input autoFocus required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <select value={tierId} onChange={(e) => setTierId(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">No tier</option>
            {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={saving} className="w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60">
            {saving ? "Adding…" : "Add to circle"}
          </button>
        </form>
      </div>
    </div>
  );
}
