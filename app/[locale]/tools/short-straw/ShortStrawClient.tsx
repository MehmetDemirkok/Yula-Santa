"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, Check, Copy, History, Plus, Shuffle, Trash2, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { secureRandomInt, secureShuffle } from "@/lib/random";
import { SITE_SHARE_SUFFIX } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Phase = "ready" | "shuffling" | "revealed";

type StrawVisual = {
  name: string;
  /** True full length in px when revealed */
  fullHeight: number;
  isShort: boolean;
};

const HIDDEN_TOP = 92;
const LONG_MIN = 168;
const LONG_SPAN = 36;
const SHORT_MIN = 96;
const SHORT_SPAN = 14;

function StrawStick({
  height,
  isShort,
  active,
  shaking,
  revealed,
}: {
  height: number;
  isShort: boolean;
  active: boolean;
  shaking: boolean;
  revealed: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `straw-${uid}`;
  const glossId = `gloss-${uid}`;

  return (
    <div
      className={`relative transition-transform duration-300 ease-out ${
        active ? "z-10 scale-110" : shaking ? "animate-[straw-wiggle_0.18s_ease-in-out_infinite]" : ""
      }`}
      style={{ height, width: 20 }}
    >
      <svg viewBox={`0 0 20 ${height}`} width={20} height={height} className="overflow-visible drop-shadow-sm" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            {isShort && revealed ? (
              <>
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="40%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#9f1239" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </>
            )}
          </linearGradient>
          <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.08)" />
          </linearGradient>
        </defs>
        <rect x="4" y="5" width="12" height={height - 9} rx="6" fill={`url(#${gradId})`} />
        <rect x="4" y="5" width="12" height={height - 9} rx="6" fill={`url(#${glossId})`} />
        <ellipse cx="10" cy="7" rx="6" ry="4.5" fill={isShort && revealed ? "#fda4af" : "#ffffff"} />
        <ellipse cx="10" cy="6.2" rx="2.8" ry="1.8" fill="rgba(255,255,255,0.65)" />
        <line
          x1="8"
          y1="18"
          x2="8"
          y2={height - 16}
          stroke={isShort && revealed ? "rgba(255,255,255,0.25)" : "rgba(148,163,184,0.45)"}
          strokeWidth="1"
        />
      </svg>
      {active && <span className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-santa-red/30 blur-xl" />}
    </div>
  );
}

/** Soft brand cuff that hides straw bottoms — no cartoon hand */
function ConcealCuff({ open }: { open: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 transition-all duration-700 ease-out ${
        open ? "translate-y-6 opacity-35" : "translate-y-0 opacity-100"
      }`}
      aria-hidden
    >
      <div className="mx-auto w-[min(100%,380px)] px-2">
        <div className="h-10 bg-gradient-to-t from-[var(--card-bg)] via-[var(--card-bg)]/90 to-transparent" />
        <div className="relative overflow-hidden rounded-2xl border border-santa-red/20 bg-gradient-to-b from-santa-red to-[#8f121c] px-4 pb-3 pt-2.5 shadow-lg shadow-santa-red/20">
          <div className="mb-2 h-1.5 rounded-full bg-white/90" />
          <div className="flex items-end justify-center gap-3 sm:gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full border border-white/25 bg-black/20 shadow-inner"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function ShortStrawPage() {
  const t = useTranslations("tools.shortStrawContent");

  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [loser, setLoser] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [straws, setStraws] = useState<StrawVisual[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);

  const howSteps = t.raw("howSteps") as string[];
  const isSelecting = phase === "shuffling";
  const canDraw = participants.length >= 2 && phase !== "shuffling";

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes straw-wiggle {
        0%, 100% { transform: rotate(-2.5deg) translateY(0); }
        50% { transform: rotate(2.5deg) translateY(-3px); }
      }
      @keyframes spark-pop {
        0% { opacity: 1; transform: translate(0,0) scale(1); }
        100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const addParticipant = () => {
    const name = newName.trim();
    if (!name || participants.includes(name)) return;
    setParticipants((prev) => [...prev, name]);
    setNewName("");
    setLoser(null);
    setPhase("ready");
    setStraws([]);
  };

  const addBulk = () => {
    const names = bulkText
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (!names.length) return;
    setParticipants((prev) => {
      const next = [...prev];
      for (const name of names) {
        if (!next.includes(name)) next.push(name);
      }
      return next;
    });
    setBulkText("");
    setBulkOpen(false);
    setLoser(null);
    setPhase("ready");
    setStraws([]);
  };

  const removeParticipant = (name: string) => {
    setParticipants((prev) => prev.filter((p) => p !== name));
    if (loser === name) {
      setLoser(null);
      setPhase("ready");
      setStraws([]);
    }
  };

  const buildEqual = (list: string[]): StrawVisual[] =>
    secureShuffle([...list]).map((name) => ({
      name,
      fullHeight: LONG_MIN + secureRandomInt(LONG_SPAN),
      isShort: false,
    }));

  const buildReveal = (list: string[], shortName: string): StrawVisual[] =>
    secureShuffle([...list]).map((name) => {
      const isShort = name === shortName;
      return {
        name,
        fullHeight: isShort
          ? SHORT_MIN + secureRandomInt(SHORT_SPAN)
          : LONG_MIN + secureRandomInt(LONG_SPAN),
        isShort,
      };
    });

  const burstSparks = () => {
    const next = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30,
      y: 30 + Math.random() * 25,
      dx: (Math.random() - 0.5) * 80,
      dy: -40 - Math.random() * 60,
    }));
    setSparks(next);
    setTimeout(() => setSparks([]), 900);
  };

  const selectLoser = () => {
    if (participants.length < 2) return;

    setPhase("shuffling");
    setLoser(null);
    setStraws(buildEqual(participants));

    let count = 0;
    const interval = setInterval(() => {
      setStraws(buildEqual(participants));
      count += 1;
      if (count > 12) {
        clearInterval(interval);
        const finalLoser = participants[secureRandomInt(participants.length)];
        setLoser(finalLoser);
        setStraws(buildReveal(participants, finalLoser));
        setPhase("revealed");
        setHistory((prev) => [finalLoser, ...prev].slice(0, 12));
        burstSparks();
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([12, 30, 12]);
      }
    }, 120);
  };

  const resetResult = () => {
    setLoser(null);
    setStraws([]);
    setPhase("ready");
  };

  const clearAll = () => {
    setParticipants([]);
    setLoser(null);
    setStraws([]);
    setNewName("");
    setPhase("ready");
  };

  const shareResult = async () => {
    if (!loser) return;
    const text = `${t("lost")} → ${loser}\n${SITE_SHARE_SUFFIX}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const displayStraws = useMemo(() => {
    if (straws.length) return straws;
    return participants.map((name) => ({
      name,
      fullHeight: LONG_MIN + 10,
      isShort: false,
    }));
  }, [straws, participants]);

  const phaseLabel =
    phase === "shuffling" ? t("phaseShuffle") : phase === "revealed" ? t("phaseReveal") : t("phaseReady");

  return (
    <div className="ys-page-shell relative overflow-hidden px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-28 right-[-8%] h-[400px] w-[400px] rounded-full bg-santa-red/12 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[-12%] h-[440px] w-[440px] rounded-full bg-rose-300/15 blur-3xl dark:bg-rose-900/10" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-8 flex items-start gap-4">
          <Link
            href="/tools"
            className="mt-1 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-2.5 shadow-md backdrop-blur transition-all hover:scale-105 hover:shadow-lg"
            aria-label={t("backToTools")}
          >
            <ArrowLeft className="h-5 w-5 text-[var(--text-secondary)]" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-label-sm font-semibold uppercase tracking-[0.18em] text-santa-red/80">
              YulaSanta
            </p>
            <h1 className="font-heading text-headline-lg-mobile text-[var(--text-primary)] sm:text-headline-lg">
              {t("title")}
            </h1>
            <p className="mt-1 text-body-md text-[var(--text-secondary)]">{t("subtitle")}</p>
          </div>
        </div>

        <article className="ys-card overflow-hidden shadow-xl shadow-santa-red/5">
          {/* Theatre stage */}
          <div
            className="relative overflow-hidden px-3 pb-3 pt-5 sm:px-5 sm:pt-6"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--santa-red) 14%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--surface-2) 0%, var(--card-bg) 100%)",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="text-label-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {t("strawsLabel")}
              </p>
              <p
                className={`text-[11px] font-semibold transition-colors ${
                  phase === "shuffling"
                    ? "animate-pulse text-santa-red"
                    : phase === "revealed"
                      ? "text-santa-red"
                      : "text-[var(--text-muted)]"
                }`}
              >
                {participants.length < 2 ? t("addPeopleFirst") : phaseLabel}
              </p>
            </div>

            <div className="relative mx-auto min-h-[280px] max-w-xl overflow-hidden rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--card-bg)] shadow-inner sm:min-h-[320px]">
              {/* soft spotlight */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 28%, rgba(255,255,255,0.55) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--santa-red) 10%, transparent), transparent 50%)",
                }}
              />

              {/* sparks on reveal */}
              {sparks.map((s) => (
                <span
                  key={s.id}
                  className="pointer-events-none absolute z-30 h-2 w-2 rounded-full bg-amber-300"
                  style={
                    {
                      left: `${s.x}%`,
                      top: `${s.y}%`,
                      animation: "spark-pop 0.85s ease-out forwards",
                      "--dx": `${s.dx}px`,
                      "--dy": `${s.dy}px`,
                    } as CSSProperties
                  }
                />
              ))}

              {participants.length === 0 ? (
                <div className="relative z-10 flex min-h-[280px] flex-col items-center justify-center px-6 text-center sm:min-h-[320px]">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-santa-red/10">
                    <Users className="h-8 w-8 text-santa-red/70" />
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{t("noParticipants")}</p>
                </div>
              ) : (
                <div className="relative z-10 flex h-full min-h-[280px] flex-col sm:min-h-[320px]">
                  <div
                    className="flex flex-1 items-end justify-center gap-2 overflow-x-auto px-3 pb-[72px] pt-8 sm:gap-3 sm:px-6"
                    role="list"
                    aria-label={t("strawsLabel")}
                  >
                    {displayStraws.map((straw, index) => {
                      const revealed = phase === "revealed";
                      const active = revealed && straw.isShort;
                      const shownHeight = revealed ? straw.fullHeight : HIDDEN_TOP;
                      return (
                        <div
                          key={`${straw.name}-${index}`}
                          role="listitem"
                          className="flex w-[56px] shrink-0 flex-col items-center sm:w-[68px]"
                          style={{
                            transition: "transform 0.35s ease",
                            transform: revealed && straw.isShort ? "translateY(8px)" : undefined,
                          }}
                        >
                          <div
                            className={`mb-2 max-w-full truncate rounded-full px-2 py-0.5 text-center text-[10px] font-bold shadow-sm sm:text-[11px] ${
                              active
                                ? "bg-santa-red text-white shadow-santa-red/30"
                                : phase === "shuffling"
                                  ? "border border-santa-red/20 bg-santa-red/10 text-santa-red"
                                  : "border border-[var(--border-light)] bg-white/80 text-[var(--text-secondary)] dark:bg-white/5"
                            }`}
                          >
                            {straw.name}
                          </div>

                          <div
                            className="relative flex items-end justify-center transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{ height: shownHeight }}
                          >
                            <StrawStick
                              height={shownHeight}
                              isShort={straw.isShort}
                              active={!!active}
                              shaking={phase === "shuffling"}
                              revealed={revealed}
                            />
                            {active && (
                              <span className="absolute -right-12 top-1/3 z-20 whitespace-nowrap rounded-full bg-santa-red px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                                {t("shortStraw")}
                              </span>
                            )}
                            {revealed && !straw.isShort && (
                              <span className="absolute -bottom-5 text-[9px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                                {t("longStraw")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <ConcealCuff open={phase === "revealed"} />
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">{t("fairNote")}</p>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="participant-name" className="text-label-md text-[var(--text-secondary)]">
                  {t("participantsLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => setBulkOpen((v) => !v)}
                  className="text-label-sm font-semibold text-santa-red hover:underline"
                >
                  {t("bulkAdd")}
                </button>
              </div>

              <div className="flex gap-2">
                <Input
                  id="participant-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                  placeholder={t("namePlaceholder")}
                  className="flex-1 focus:border-santa-red/40"
                  disabled={isSelecting}
                />
                <Button
                  onClick={addParticipant}
                  disabled={!newName.trim() || isSelecting}
                  className="aspect-square w-11 shrink-0 p-0"
                  aria-label={t("add")}
                >
                  <Plus className="h-5 w-5 text-white" strokeWidth={2.5} aria-hidden="true" />
                </Button>
              </div>

              {bulkOpen && (
                <div className="mt-3 animate-fade-in space-y-2 rounded-2xl border border-[var(--border-light)] bg-[var(--surface-2)] p-3">
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={t("bulkPlaceholder")}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-santa-red/40"
                  />
                  <Button onClick={addBulk} disabled={!bulkText.trim()} className="w-full" size="sm">
                    {t("add")}
                  </Button>
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-label-md text-[var(--text-secondary)]">
                {t("label")} ({participants.length})
              </p>
              {participants.length > 0 ? (
                <div className="flex flex-wrap gap-2" role="list">
                  {participants.map((name) => {
                    const isLoser = loser === name && phase === "revealed";
                    return (
                      <div
                        key={name}
                        role="listitem"
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                          isLoser
                            ? "scale-105 border-santa-red bg-santa-red text-white shadow-lg shadow-santa-red/25"
                            : "border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
                        }`}
                      >
                        <span className="text-sm font-semibold">{name}</span>
                        {!isSelecting && (
                          <button
                            type="button"
                            onClick={() => removeParticipant(name)}
                            className={`transition-colors ${
                              isLoser ? "text-white/70 hover:text-white" : "text-[var(--text-muted)] hover:text-santa-red"
                            }`}
                            aria-label={`${t("remove")} ${name}`}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--border-medium)] py-8 text-center text-[var(--text-muted)]">
                  <p>{t("noParticipants")}</p>
                </div>
              )}
              {participants.length === 1 && (
                <p className="mt-2 text-label-sm text-santa-red/80">{t("tipMin")}</p>
              )}
            </div>

            {loser && phase === "revealed" && (
              <div
                className="animate-fade-in rounded-2xl bg-gradient-to-br from-santa-red to-[#9f1239] p-6 text-center text-white shadow-xl shadow-santa-red/20"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="mb-1 text-label-sm uppercase tracking-widest text-white/75">{t("lost")}</p>
                <p className="font-heading text-3xl font-black tracking-tight sm:text-4xl">{loser}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={shareResult}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? t("copied") : t("share")}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={selectLoser} disabled={!canDraw} size="lg" className="w-full">
                <Shuffle className={`h-5 w-5 ${isSelecting ? "animate-spin" : ""}`} aria-hidden="true" />
                {isSelecting ? t("selecting") : loser ? t("drawAgain") : t("draw")}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                {loser && phase === "revealed" && (
                  <Button onClick={resetResult} variant="secondary" className="w-full">
                    {t("newRound")}
                  </Button>
                )}
                {participants.length > 0 && (
                  <Button
                    onClick={clearAll}
                    variant="secondary"
                    className={`w-full ${loser && phase === "revealed" ? "" : "col-span-2"}`}
                    disabled={isSelecting}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t("clearList")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </article>

        {history.length > 0 && (
          <section className="mt-5 ys-card p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-heading text-headline-md text-[var(--text-primary)]">
                <History className="h-5 w-5 text-santa-red" />
                {t("history")}
              </h2>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-label-sm font-semibold text-[var(--text-muted)] hover:text-santa-red"
              >
                {t("clearHistory")}
              </button>
            </div>
            <ol className="space-y-2">
              {history.map((name, idx) => (
                <li
                  key={`${name}-${idx}`}
                  className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${
                    idx === 0
                      ? "border-santa-red/25 bg-santa-red/5 font-semibold text-santa-red"
                      : "border-[var(--border-light)] text-[var(--text-secondary)]"
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-label-sm text-[var(--text-muted)]">#{idx + 1}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <section className="ys-card p-6">
            <h2 className="mb-4 font-heading text-headline-md text-[var(--text-primary)]">{t("howTitle")}</h2>
            <ol className="space-y-3">
              {howSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-[var(--text-secondary)]">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-santa-red/10 text-sm font-bold text-santa-red">
                    {i + 1}
                  </span>
                  <span className="pt-0.5 text-body-md leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="ys-card p-6">
            <h2 className="mb-3 font-heading text-headline-md text-[var(--text-primary)]">{t("aboutTitle")}</h2>
            <p className="text-body-md leading-relaxed text-[var(--text-secondary)]">{t("aboutText")}</p>
            <p className="mt-4 text-label-sm text-[var(--text-muted)]">{t("fairNote")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
