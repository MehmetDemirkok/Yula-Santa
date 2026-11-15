"use client";

import { useState } from "react";
import { ChevronDown, Plus, X, Ban, CalendarDays, Users, Check, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LIMITS, type SantaEvent } from "@/lib/secretSanta/link";
import { nameKey, type Exclusion, type SantaGroup } from "@/lib/secretSanta/draw";

const fieldClass =
    "w-full h-[44px] rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--input-focus)] focus:outline-none transition-colors";
const labelClass = "block text-xs font-bold text-[var(--text-secondary)] mb-1 text-start";

/**
 * Optional Secret Santa settings: "these two must not draw each other" rules
 * and event details (group name, budget, date, note) shown on every link.
 */
export function SantaOptions({
    participants,
    exclusions,
    onExclusionsChange,
    groups,
    onGroupsChange,
    event,
    onEventChange,
    showEvent,
}: {
    participants: string[];
    exclusions: Exclusion[];
    onExclusionsChange: (next: Exclusion[]) => void;
    groups: SantaGroup[];
    onGroupsChange: (next: SantaGroup[]) => void;
    event: SantaEvent;
    onEventChange: (next: SantaEvent) => void;
    /** Event details only matter where people get their own view (secret mode). */
    showEvent: boolean;
}) {
    const t = useTranslations("santa");
    const [open, setOpen] = useState(exclusions.length > 0 || groups.length > 0 || Boolean(event.name || event.budget || event.date || event.note));
    const [a, setA] = useState("");
    const [b, setB] = useState("");
    const [groupName, setGroupName] = useState("");
    const [editingGroup, setEditingGroup] = useState<string | null>(null);

    /** Which group each person is in (by nameKey); a person belongs to at most one group. */
    const groupOf = new Map<string, SantaGroup>();
    groups.forEach((g) => g.members.forEach((m) => groupOf.set(m, g)));

    const addGroup = () => {
        const name = groupName.trim().replace(/\s+/g, " ").slice(0, 40);
        if (!name) return;
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        onGroupsChange([...groups, { id, name, members: [] }]);
        setGroupName("");
        setEditingGroup(id);
    };

    const toggleMember = (group: SantaGroup, person: string) => {
        const key = nameKey(person);
        onGroupsChange(
            groups.map((g) =>
                g.id !== group.id
                    ? g
                    : { ...g, members: g.members.includes(key) ? g.members.filter((m) => m !== key) : [...g.members, key] }
            )
        );
    };

    const canAdd =
        a &&
        b &&
        nameKey(a) !== nameKey(b) &&
        !exclusions.some(([x, y]) => {
            const pair = [nameKey(x), nameKey(y)].sort().join("|");
            return pair === [nameKey(a), nameKey(b)].sort().join("|");
        });

    const addRule = () => {
        if (!canAdd) return;
        onExclusionsChange([...exclusions, [a, b]]);
        setA("");
        setB("");
    };

    const summary = [
        exclusions.length ? t("rulesCount", { count: exclusions.length }) : null,
        groups.length ? t("groupsCount", { count: groups.length }) : null,
        showEvent && (event.budget || event.date) ? [event.budget, event.date].filter(Boolean).join(" · ") : null,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="rounded-xl border border-[var(--border-light)] bg-[var(--surface-2)]/60 text-start">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-bold text-[var(--text-primary)]"
            >
                <span className="min-w-0">
                    {showEvent ? t("optionsTitle") : t("rulesOnlyTitle")}
                    <span className="ms-2 text-xs font-medium text-[var(--text-muted)]">{summary || t("optional")}</span>
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="px-3 pb-3 space-y-4">
                    <section className="space-y-2">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                <Ban className="w-4 h-4 text-santa-red" /> {t("rulesTitle")}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">{t("rulesDesc")}</p>
                        </div>
                        {participants.length < 2 ? (
                            <p className="text-xs text-[var(--text-muted)]">{t("rulesNeedPeople")}</p>
                        ) : (
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                                <select aria-label={t("rulesPick")} value={a} onChange={(e) => setA(e.target.value)} className={fieldClass}>
                                    <option value="">{t("rulesPick")}</option>
                                    {participants.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <select aria-label={t("rulesPick")} value={b} onChange={(e) => setB(e.target.value)} className={fieldClass}>
                                    <option value="">{t("rulesPick")}</option>
                                    {participants.filter((p) => nameKey(p) !== nameKey(a)).map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={addRule}
                                    disabled={!canAdd}
                                    aria-label={t("rulesAdd")}
                                    className="w-[44px] h-[44px] rounded-lg bg-santa-red text-white flex items-center justify-center disabled:opacity-40 transition-opacity"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        {exclusions.length > 0 && (
                            <ul className="flex flex-wrap gap-2">
                                {exclusions.map(([x, y], i) => (
                                    <li
                                        key={`${x}|${y}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--border-light)] ps-3 pe-1 py-1 text-xs font-semibold text-[var(--text-secondary)]"
                                    >
                                        {x} <Ban className="w-3 h-3 text-santa-red" aria-hidden /> {y}
                                        <button
                                            type="button"
                                            onClick={() => onExclusionsChange(exclusions.filter((_, j) => j !== i))}
                                            aria-label={t("rulesRemove", { a: x, b: y })}
                                            className="!min-h-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--surface-2)]"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="space-y-2 pt-3 border-t border-[var(--border-light)]">
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-indigo-500" /> {t("groupsTitle")}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">{t("groupsDesc")}</p>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                            <input
                                aria-label={t("groupName")}
                                className={fieldClass}
                                maxLength={40}
                                placeholder={t("groupNamePlaceholder")}
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addGroup()}
                            />
                            <button
                                type="button"
                                onClick={addGroup}
                                disabled={!groupName.trim()}
                                className="h-[44px] px-3 rounded-lg bg-indigo-600 text-white text-sm font-bold inline-flex items-center gap-1 disabled:opacity-40"
                            >
                                <Plus className="w-4 h-4" /> {t("groupAdd")}
                            </button>
                        </div>
                        {groups.map((group) => {
                            const editing = editingGroup === group.id;
                            const memberNames = participants.filter((p) => group.members.includes(nameKey(p)));
                            return (
                                <div key={group.id} className="rounded-lg border border-[var(--border-light)] bg-[var(--card-bg)] p-2.5 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingGroup(editing ? null : group.id)}
                                            aria-expanded={editing}
                                            className="!min-h-0 min-w-0 flex-1 text-start"
                                        >
                                            <span className="block text-sm font-bold text-[var(--text-primary)] truncate">
                                                {group.name}{" "}
                                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                                    · {t("groupMembers", { count: memberNames.length })}
                                                </span>
                                            </span>
                                            {!editing && (
                                                <span className="block text-xs text-[var(--text-muted)] truncate">
                                                    {memberNames.length ? memberNames.join(", ") : t("groupTapToPick")}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingGroup(editing ? null : group.id)}
                                            className="h-[36px] px-2.5 rounded-lg border border-[var(--border-medium)] text-xs font-bold text-[var(--text-secondary)]"
                                        >
                                            {editing ? t("groupDone") : t("groupEdit")}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onGroupsChange(groups.filter((g) => g.id !== group.id))}
                                            aria-label={t("groupRemove", { group: group.name })}
                                            className="w-[36px] h-[36px] rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {editing && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {participants.length === 0 && (
                                                <p className="text-xs text-[var(--text-muted)]">{t("rulesNeedPeople")}</p>
                                            )}
                                            {participants.map((p) => {
                                                const owner = groupOf.get(nameKey(p));
                                                const inThis = owner?.id === group.id;
                                                const elsewhere = Boolean(owner) && !inThis;
                                                return (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        disabled={elsewhere}
                                                        aria-pressed={inThis}
                                                        onClick={() => toggleMember(group, p)}
                                                        title={elsewhere ? t("groupInOther", { group: owner!.name }) : undefined}
                                                        className={`!min-h-0 h-[36px] inline-flex items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors ${
                                                            inThis
                                                                ? "bg-indigo-600 border-indigo-600 text-white"
                                                                : "bg-[var(--surface-2)] border-[var(--border-light)] text-[var(--text-secondary)]"
                                                        } disabled:opacity-40 disabled:line-through`}
                                                    >
                                                        {inThis && <Check className="w-3 h-3" strokeWidth={3} />}
                                                        {p}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </section>

                    {showEvent && (
                        <section className="space-y-2 pt-3 border-t border-[var(--border-light)]">
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4 text-christmas-green" /> {t("eventTitle")}
                                </h3>
                                <p className="text-xs text-[var(--text-muted)]">{t("eventDesc")}</p>
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="santa-event-name">{t("eventName")}</label>
                                <input
                                    id="santa-event-name"
                                    className={fieldClass}
                                    maxLength={LIMITS.eventName}
                                    placeholder={t("eventNamePlaceholder")}
                                    value={event.name ?? ""}
                                    onChange={(e) => onEventChange({ ...event, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelClass} htmlFor="santa-event-budget">{t("budget")}</label>
                                    <input
                                        id="santa-event-budget"
                                        className={fieldClass}
                                        maxLength={LIMITS.budget}
                                        placeholder={t("budgetPlaceholder")}
                                        value={event.budget ?? ""}
                                        onChange={(e) => onEventChange({ ...event, budget: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass} htmlFor="santa-event-date">{t("date")}</label>
                                    <input
                                        id="santa-event-date"
                                        type="date"
                                        className={fieldClass}
                                        value={event.date ?? ""}
                                        onChange={(e) => onEventChange({ ...event, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass} htmlFor="santa-event-note">{t("note")}</label>
                                <textarea
                                    id="santa-event-note"
                                    rows={2}
                                    maxLength={LIMITS.note}
                                    className={`${fieldClass} h-auto py-2 resize-none`}
                                    placeholder={t("notePlaceholder")}
                                    value={event.note ?? ""}
                                    onChange={(e) => onEventChange({ ...event, note: e.target.value })}
                                />
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
