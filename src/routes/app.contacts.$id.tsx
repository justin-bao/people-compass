import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cadenceHealth, tierDotClass } from "@/lib/cadence";
import { ArrowLeft, Phone, Coffee, Mail, MessageSquare, Video, Plus, Trash2, Calendar as CalIcon, Instagram, Linkedin, Music2, Twitter, Pencil, History, X, Check, StickyNote } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/contacts/$id")({
  head: () => ({ meta: [{ title: "Contact — Kinship" }] }),
  component: ContactDetail,
});

type Contact = {
  id: string; name: string; avatar_url: string | null; tier_id: string | null;
  email: string | null; phone: string | null; birthday: string | null;
  location: string | null; role: string | null; company: string | null;
  instagram: string | null; linkedin: string | null; x_handle: string | null; tiktok: string | null;
  bio: string | null; last_contacted_at: string | null;
};
type Tier = { id: string; name: string; color: string; cadence_days: number };
type Interaction = { id: string; type: string; occurred_at: string; notes: string | null };
type Note = { id: string; body: string; created_at: string; updated_at: string };
type NoteRevision = { id: string; note_id: string; body: string; change_type: string; created_at: string };
type Reminder = { id: string; due_at: string; message: string | null; status: string };

const interactionTypes = [
  { key: "call", label: "Call", icon: Phone },
  { key: "lunch", label: "In person", icon: Coffee },
  { key: "text", label: "Text", icon: MessageSquare },
  { key: "email", label: "Email", icon: Mail },
  { key: "video", label: "Video", icon: Video },
  { key: "note", label: "Note", icon: StickyNote },
];

const typeMeta: Record<string, { label: string; icon: any }> = Object.fromEntries(
  interactionTypes.map((t) => [t.key, { label: t.label, icon: t.icon }])
);

function ContactDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [noteText, setNoteText] = useState("");
  const [editing, setEditing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [historyFor, setHistoryFor] = useState<Note | null>(null);
  const [revisions, setRevisions] = useState<NoteRevision[]>([]);

  const load = async () => {
    const [c, ts, ints, ns, rs] = await Promise.all([
      supabase.from("contacts").select("*").eq("id", id).single(),
      supabase.from("tiers").select("*").order("sort_order"),
      supabase.from("interactions").select("*").eq("contact_id", id).order("occurred_at", { ascending: false }),
      supabase.from("notes").select("*").eq("contact_id", id).order("created_at", { ascending: false }),
      supabase.from("reminders").select("*").eq("contact_id", id).eq("status", "pending").order("due_at"),
    ]);
    if (c.error) {
      toast.error("Couldn't load contact");
      navigate({ to: "/app/contacts" });
      return;
    }
    setContact(c.data as Contact);
    setTiers(ts.data ?? []);
    setTier((ts.data ?? []).find((t) => t.id === c.data?.tier_id) ?? null);
    setInteractions(ints.data ?? []);
    setNotes(ns.data ?? []);
    setReminders(rs.data ?? []);
  };

  useEffect(() => { if (user) load(); }, [user, id]);

  if (!contact) return <div className="serif italic text-muted-foreground">Loading…</div>;

  const h = cadenceHealth(contact.last_contacted_at, tier?.cadence_days ?? 60);

  const logInteraction = async (type: string, notesText?: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("interactions").insert({
      user_id: user.id, contact_id: contact.id, type, occurred_at: now, notes: notesText || null,
    });
    if (error) return toast.error(error.message);
    await supabase.from("contacts").update({ last_contacted_at: now }).eq("id", contact.id);
    toast.success("Logged");
    load();
  };

  const addNote = async () => {
    if (!user || !noteText.trim()) return;
    const { error } = await supabase.from("notes").insert({
      user_id: user.id, contact_id: contact.id, body: noteText.trim(),
    });
    if (error) return toast.error(error.message);
    setNoteText("");
    load();
  };

  const saveNoteEdit = async () => {
    if (!editingNoteId || !editingNoteText.trim()) return;
    const { error } = await supabase.from("notes").update({ body: editingNoteText.trim() }).eq("id", editingNoteId);
    if (error) return toast.error(error.message);
    setEditingNoteId(null);
    setEditingNoteText("");
    toast.success("Note updated");
    load();
  };

  const deleteNote = async (nid: string) => {
    if (!confirm("Delete this note? A snapshot will remain in its history.")) return;
    const { error } = await supabase.from("notes").delete().eq("id", nid);
    if (error) return toast.error(error.message);
    toast.success("Note deleted");
    load();
  };

  const openHistory = async (note: Note) => {
    setHistoryFor(note);
    const { data } = await supabase.from("note_revisions").select("*").eq("note_id", note.id).order("created_at", { ascending: false });
    setRevisions(data ?? []);
  };

  const restoreRevision = async (rev: NoteRevision) => {
    if (!historyFor) return;
    const { error } = await supabase.from("notes").update({ body: rev.body }).eq("id", historyFor.id);
    if (error) return toast.error(error.message);
    toast.success("Restored");
    setHistoryFor(null);
    load();
  };

  const deleteContact = async () => {
    if (!confirm(`Remove ${contact.name} from your circle?`)) return;
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    navigate({ to: "/app/contacts" });
  };

  const scheduleReminder = async () => {
    if (!user) return;
    const days = parseInt(prompt("Remind me in how many days?", "7") || "");
    if (!days) return;
    const due = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await supabase.from("reminders").insert({
      user_id: user.id, contact_id: contact.id, due_at: due, message: `Reach out to ${contact.name}`,
    });
    if (error) return toast.error(error.message);
    toast.success(`Reminder set for ${days} days`);
    load();
  };

  const dismissReminder = async (rid: string) => {
    await supabase.from("reminders").update({ status: "done" }).eq("id", rid);
    load();
  };

  return (
    <div className="space-y-6">
      <Link to="/app/contacts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All people
      </Link>

      {/* Header card */}
      <div className="bento bento-lift">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-medium shrink-0 overflow-hidden">
            {contact.avatar_url ? <img src={contact.avatar_url} alt={contact.name} className="h-full w-full object-cover" /> : contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="display text-4xl">{contact.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
              {tier && <><span className={`h-1.5 w-1.5 rounded-full ${tierDotClass[tier.color] ?? "bg-sage"}`} />{tier.name}</>}
              {contact.role && <span>· {contact.role}</span>}
              {contact.company && <span>at {contact.company}</span>}
              {contact.location && <span>· {contact.location}</span>}
            </div>
            {contact.bio && <p className="mt-3 text-sm text-muted-foreground italic serif">{contact.bio}</p>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setEditing(true)} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            <button onClick={deleteContact} className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Cadence bar */}
        {tier && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                {h.status === "new" ? "Never logged a moment" :
                 h.status === "fresh" ? "Recently in touch" :
                 h.status === "due-soon" ? "Due soon" :
                 `${h.overdueDays} days overdue`}
              </span>
              <span>Every {tier.cadence_days} days</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  h.status === "fresh" ? "bg-[oklch(0.572_0.058_145)]" :
                  h.status === "due-soon" ? "bg-[oklch(0.785_0.043_140)]" :
                  h.status === "overdue" ? "bg-[oklch(0.660_0.090_50)]" : "bg-muted-foreground/40"
                }`}
                style={{ width: `${Math.min(100, Math.max(4, h.ratio * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick log */}
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">Just chatted?</span>
          {interactionTypes.map((t) => (
            <button key={t.key} onClick={() => logInteraction(t.key)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-secondary transition">
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
          <button onClick={scheduleReminder} className="rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs flex items-center gap-1.5 hover:opacity-90 transition ml-auto">
            <CalIcon className="h-3.5 w-3.5" /> Set reminder
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Timeline */}
        <div className="bento md:col-span-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="serif text-2xl">Timeline</h2>
            <div className="text-xs text-muted-foreground">
              {(() => {
                const filtered = typeFilter ? interactions.filter((i) => i.type === typeFilter) : interactions;
                return `${filtered.length} ${filtered.length === 1 ? "moment" : "moments"}`;
              })()}
            </div>
          </div>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setTypeFilter(null)}
              className={`rounded-full px-3 py-1 text-xs border transition ${typeFilter === null ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:bg-secondary"}`}
            >
              All
            </button>
            {interactionTypes.map((t) => {
              const count = interactions.filter((i) => i.type === t.key).length;
              if (count === 0) return null;
              const active = typeFilter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(active ? null : t.key)}
                  className={`rounded-full px-3 py-1 text-xs border flex items-center gap-1.5 transition ${active ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:bg-secondary"}`}
                >
                  <t.icon className="h-3 w-3" /> {t.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
          {(() => {
            const filtered = typeFilter ? interactions.filter((i) => i.type === typeFilter) : interactions;
            if (filtered.length === 0) {
              return <p className="text-sm text-muted-foreground py-4">{interactions.length === 0 ? "No moments logged yet. Use the buttons above." : "No moments match this filter."}</p>;
            }
            // Group by month for richer timeline
            const groups: Record<string, Interaction[]> = {};
            filtered.forEach((i) => {
              const k = new Date(i.occurred_at).toLocaleDateString("en", { month: "long", year: "numeric" });
              (groups[k] ||= []).push(i);
            });
            return (
              <div className="space-y-6">
                {Object.entries(groups).map(([month, items]) => (
                  <div key={month}>
                    <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">{month}</div>
                    <ol className="relative border-l border-border pl-5 space-y-4">
                      {items.map((i) => {
                        const meta = typeMeta[i.type] ?? { label: i.type, icon: StickyNote };
                        const Icon = meta.icon;
                        const d = new Date(i.occurred_at);
                        return (
                          <li key={i.id} className="relative">
                            <span className="absolute -left-[31px] top-0.5 h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center">
                              <Icon className="h-2.5 w-2.5 text-primary" />
                            </span>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-sm font-medium">{meta.label}</span>
                              <span className="text-xs text-muted-foreground serif italic">
                                {d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })} · {d.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                              </span>
                            </div>
                            {i.notes && <p className="text-sm text-muted-foreground mt-1">{i.notes}</p>}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Details */}
        <div className="bento md:col-span-2">
          <h2 className="serif text-xl mb-3">Details</h2>
          <dl className="text-sm space-y-2">
            {contact.email && <Row label="Email" value={contact.email} href={`mailto:${contact.email}`} />}
            {contact.phone && <Row label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />}
            {contact.birthday && <Row label="Birthday" value={new Date(contact.birthday).toLocaleDateString("en", { month: "long", day: "numeric" })} />}
            {!contact.email && !contact.phone && !contact.birthday && (
              <p className="text-muted-foreground text-xs">Add details to start connecting.</p>
            )}
          </dl>
        </div>

        {/* Notes */}
        <div className="bento md:col-span-3">
          <h2 className="serif text-xl mb-3">Notes</h2>
          <div className="flex gap-2 mb-3">
            <input
              placeholder="Something to remember…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={addNote} className="rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 transition"><Plus className="h-4 w-4" /></button>
          </div>
          <ul className="space-y-2">
            {notes.length === 0 && <li className="text-xs text-muted-foreground">No notes yet.</li>}
            {notes.map((n) => (
              <li key={n.id} className="text-sm bg-background rounded-2xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </div>
                {n.body}
              </li>
            ))}
          </ul>
        </div>

        {/* Reminders */}
        <div className="bento md:col-span-3">
          <h2 className="serif text-xl mb-3">Reminders</h2>
          {reminders.length === 0 ? (
            <p className="text-xs text-muted-foreground">None scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="text-sm bg-background rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{new Date(r.due_at).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</div>
                    <div className="text-xs text-muted-foreground">{r.message}</div>
                  </div>
                  <button onClick={() => dismissReminder(r.id)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">Done</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Content hub */}
        <div className="bento md:col-span-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="serif text-2xl">Content hub</h2>
            <Link to="/app/settings" className="text-xs text-muted-foreground hover:text-foreground">Manage integrations</Link>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Recent activity and updates from {contact.name.split(" ")[0]} across their channels.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SocialCard icon={Mail} label="Gmail" handle={contact.email} status="Connect Gmail in Settings" />
            <SocialCard icon={Instagram} label="Instagram" handle={contact.instagram} status="Coming soon" />
            <SocialCard icon={Linkedin} label="LinkedIn" handle={contact.linkedin} status="Coming soon" />
            <SocialCard icon={Twitter} label="X" handle={contact.x_handle} status="Coming soon" />
            <SocialCard icon={Music2} label="TikTok" handle={contact.tiktok} status="Coming soon" />
          </div>
        </div>
      </div>

      {editing && <EditContactModal contact={contact} tiers={tiers} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />}
    </div>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      {href ? <a href={href} className="font-medium text-right truncate hover:underline">{value}</a> : <dd className="font-medium text-right truncate">{value}</dd>}
    </div>
  );
}

function SocialCard({ icon: Icon, label, handle, status }: { icon: any; label: string; handle: string | null; status: string }) {
  return (
    <div className="rounded-2xl bg-background border border-border p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-xs text-muted-foreground truncate">{handle || status}</div>
    </div>
  );
}

function EditContactModal({ contact, tiers, onClose, onSaved }: { contact: Contact; tiers: Tier[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(contact);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("contacts").update({
      name: form.name, tier_id: form.tier_id, email: form.email, phone: form.phone,
      birthday: form.birthday, location: form.location, role: form.role, company: form.company,
      instagram: form.instagram, linkedin: form.linkedin, x_handle: form.x_handle, tiktok: form.tiktok,
      bio: form.bio,
    }).eq("id", contact.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    onSaved();
  };

  const set = (k: keyof Contact) => (e: any) => setForm({ ...form, [k]: e.target.value || null });
  const inputClass = "w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-card rounded-3xl border border-border w-full max-w-lg p-6 shadow-lift my-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="serif text-2xl mb-4">Edit {contact.name.split(" ")[0]}</h2>
        <form onSubmit={submit} className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          <input required value={form.name ?? ""} onChange={set("name")} placeholder="Name" className={inputClass} />
          <select value={form.tier_id ?? ""} onChange={(e) => setForm({ ...form, tier_id: e.target.value || null })} className={inputClass}>
            <option value="">No tier</option>
            {tiers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <textarea value={form.bio ?? ""} onChange={set("bio")} placeholder="Bio / how you met / what they care about" rows={3} className={inputClass} />
          <div className="grid grid-cols-2 gap-2">
            <input value={form.role ?? ""} onChange={set("role")} placeholder="Role" className={inputClass} />
            <input value={form.company ?? ""} onChange={set("company")} placeholder="Company" className={inputClass} />
          </div>
          <input value={form.location ?? ""} onChange={set("location")} placeholder="Location" className={inputClass} />
          <input type="email" value={form.email ?? ""} onChange={set("email")} placeholder="Email" className={inputClass} />
          <input value={form.phone ?? ""} onChange={set("phone")} placeholder="Phone" className={inputClass} />
          <input type="date" value={form.birthday ?? ""} onChange={set("birthday")} placeholder="Birthday" className={inputClass} />
          <div className="pt-2 text-xs text-muted-foreground">Social handles</div>
          <input value={form.instagram ?? ""} onChange={set("instagram")} placeholder="Instagram @handle" className={inputClass} />
          <input value={form.linkedin ?? ""} onChange={set("linkedin")} placeholder="LinkedIn URL" className={inputClass} />
          <input value={form.x_handle ?? ""} onChange={set("x_handle")} placeholder="X @handle" className={inputClass} />
          <input value={form.tiktok ?? ""} onChange={set("tiktok")} placeholder="TikTok @handle" className={inputClass} />
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-border bg-background py-2.5 text-sm hover:bg-secondary transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-primary py-2.5 text-sm text-primary-foreground hover:opacity-90 transition disabled:opacity-60">{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
