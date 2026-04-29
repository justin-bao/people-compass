import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { tierDotClass } from "@/lib/cadence";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tiers")({
  head: () => ({ meta: [{ title: "Tiers — Kinship" }] }),
  component: Tiers,
});

type Tier = { id: string; name: string; color: string; cadence_days: number; sort_order: number };

const colorOptions = ["forest", "sage", "clay", "slate", "sand"];

function Tiers() {
  const { user } = useAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    const [t, c] = await Promise.all([
      supabase.from("tiers").select("*").order("sort_order"),
      supabase.from("contacts").select("tier_id"),
    ]);
    setTiers(t.data ?? []);
    const map: Record<string, number> = {};
    (c.data ?? []).forEach((r: any) => {
      if (r.tier_id) map[r.tier_id] = (map[r.tier_id] ?? 0) + 1;
    });
    setCounts(map);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const update = async (id: string, patch: Partial<Tier>) => {
    const { error } = await supabase.from("tiers").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const add = async () => {
    if (!user) return;
    const { error } = await supabase.from("tiers").insert({
      user_id: user.id, name: "New tier", color: "sage", cadence_days: 30, sort_order: tiers.length + 1,
    });
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this tier? Contacts will become untiered.")) return;
    const { error } = await supabase.from("tiers").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display text-4xl md:text-5xl">Your <span className="display-italic">tiers</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Define how often you want to stay in touch with each circle.</p>
        </div>
        <button onClick={add} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
          <Plus className="h-4 w-4" /> New tier
        </button>
      </div>

      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.id} className="bento flex items-center gap-4 flex-wrap">
            <div className={`h-3 w-3 rounded-full ${tierDotClass[t.color] ?? "bg-sage"}`} />
            <input
              value={t.name}
              onChange={(e) => setTiers(tiers.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))}
              onBlur={(e) => update(t.id, { name: e.target.value })}
              className="serif text-2xl bg-transparent focus:outline-none focus:bg-background rounded-lg px-2 py-1 -mx-2 flex-1 min-w-[150px]"
            />
            <div className="flex items-center gap-2">
              <select value={t.color} onChange={(e) => update(t.id, { color: e.target.value })} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                <span className="text-xs text-muted-foreground">every</span>
                <input
                  type="number"
                  min={1}
                  value={t.cadence_days}
                  onChange={(e) => setTiers(tiers.map((x) => x.id === t.id ? { ...x, cadence_days: parseInt(e.target.value) || 1 } : x))}
                  onBlur={(e) => update(t.id, { cadence_days: parseInt(e.target.value) || 1 })}
                  className="w-12 bg-transparent text-sm text-center focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">days</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{counts[t.id] ?? 0} people</span>
              <button onClick={() => remove(t.id)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
