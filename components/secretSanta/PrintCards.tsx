"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { nameKey } from "@/lib/secretSanta/draw";
import type { SantaEvent } from "@/lib/secretSanta/link";
import styles from "./print.module.css";

type Props = {
    locale: string;
    givers: string[];
    assignments: Record<string, string>;
    hints: Record<string, string>;
    event?: SantaEvent;
    /** Blur the receivers on screen so the organizer can check the layout without reading every match. */
    hideOnScreen: boolean;
};

function formatDate(date: string, locale: string): string {
    try {
        return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
            new Date(`${date}T00:00:00Z`)
        );
    } catch {
        return date;
    }
}

/** Dense diagonal hatch that hides the folded-over receiver from show-through. */
function PrivacyPattern({ id }: { id: string }) {
    return (
        <svg className={styles.pattern} aria-hidden preserveAspectRatio="none">
            <defs>
                <pattern id={id} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="7" height="7" fill="#5b5b5b" />
                    <rect width="3.5" height="7" fill="#2b2b2b" />
                    <circle cx="5.2" cy="2" r="1.1" fill="#8a8a8a" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
    );
}

function Sheet({ locale, givers, assignments, hints, event, idPrefix }: Omit<Props, "hideOnScreen"> & { idPrefix: string }) {
    const t = useTranslations("santa");
    const title = event?.name || t("calendarTitle");
    const details = [event?.budget, event?.date ? formatDate(event.date, locale) : ""].filter(Boolean).join(" · ");
    return (
        <>
            <p className={styles.instructions}>
                <strong>{t("printHowTitle")}</strong> {t("printHowSteps")}
            </p>
            {givers.map((giver, i) => {
                const receiver = assignments[giver];
                const hint = hints[nameKey(receiver)];
                return (
                    <div key={giver} className={styles.card}>
                        <div className={styles.panel}>
                            <span className={styles.brand}>🎁 {title}</span>
                            <span className={styles.name}>{giver}</span>
                            <span className={styles.small}>{t("printCardFor")}</span>
                        </div>
                        <div className={styles.panel}>
                            <span className={styles.foldMark}>2</span>
                            <PrivacyPattern id={`${idPrefix}-p${i}`} />
                            <span className={styles.patternLabel}>{t("printPatternLabel")}</span>
                        </div>
                        <div className={`${styles.panel} ${styles.receiver}`}>
                            <span className={styles.foldMark}>1</span>
                            <span className={styles.label}>{t("printGiftFor")}</span>
                            <span className={styles.name}>{receiver}</span>
                            {hint && <span className={styles.small}>💡 {hint}</span>}
                            {details && <span className={styles.small}>{details}</span>}
                            {event?.note && <span className={styles.small}>{event.note}</span>}
                        </div>
                    </div>
                );
            })}
        </>
    );
}

/**
 * On-screen preview plus a print-only copy portalled into <body>, so the
 * printout contains the cards alone (see the print rules in globals.css).
 */
export function PrintCards(props: Props) {
    const [mounted, setMounted] = useState(false);
    // createPortal needs document.body, which only exists after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);
    const { hideOnScreen, ...sheet } = props;

    return (
        <>
            <div className={`${styles.sheet} ${hideOnScreen ? styles.hidden : ""}`}>
                <Sheet {...sheet} idPrefix="screen" />
            </div>
            {mounted &&
                createPortal(
                    <div className={`ys-santa-print ${styles.printOnly}`}>
                        <div className={styles.sheet}>
                            <Sheet {...sheet} idPrefix="print" />
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
