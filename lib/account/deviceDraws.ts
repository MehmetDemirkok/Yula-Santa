/**
 * What the account page lists under "My recent draws (this device)". Pure and
 * client-safe: it reads the same localStorage keys the tools write and returns
 * only counts and dates. Nothing here leaves the browser.
 */

export type DeviceDraw =
    | { kind: "santaResult"; people: number; at: string | null; href: "/result" }
    | { kind: "santaDraft"; people: number; href: "/secret-santa" }
    | { kind: "raffleDraft"; people: number; href: "/raffle" }
    | { kind: "wheel"; options: number; spins: number; at: number | null; href: "/tools/wheel-of-fortune" };

/** Keys written by lib/secretSanta/storage.ts, RaffleBoard (raffle page) and WheelClient. */
export const DEVICE_DRAW_KEYS = {
    santaDraw: "secret_santa_draw_v2",
    santaDraft: "participants_draft",
    raffleDraft: "generic_raffle_draft",
    wheel: "yulasanta_wheel_v1",
} as const;

function parse(raw: string | null): unknown {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const countNames = (value: unknown) => (Array.isArray(value) ? value.filter((v) => typeof v === "string" && v.trim()).length : 0);

export function readDeviceDraws(getItem: (key: string) => string | null): DeviceDraw[] {
    const draws: DeviceDraw[] = [];

    const santa = parse(getItem(DEVICE_DRAW_KEYS.santaDraw));
    if (isObject(santa) && isObject(santa.assignments)) {
        const people = Object.keys(santa.assignments).length;
        if (people > 0) draws.push({ kind: "santaResult", people, at: typeof santa.createdAt === "string" ? santa.createdAt : null, href: "/result" });
    }

    const santaDraft = countNames(parse(getItem(DEVICE_DRAW_KEYS.santaDraft)));
    if (santaDraft > 0) draws.push({ kind: "santaDraft", people: santaDraft, href: "/secret-santa" });

    const raffle = countNames(parse(getItem(DEVICE_DRAW_KEYS.raffleDraft)));
    if (raffle > 0) draws.push({ kind: "raffleDraft", people: raffle, href: "/raffle" });

    const wheel = parse(getItem(DEVICE_DRAW_KEYS.wheel));
    if (isObject(wheel) && wheel.isSample !== true) {
        const options = countNames(wheel.segments);
        const history = Array.isArray(wheel.history) ? wheel.history : [];
        const last = history.find(isObject);
        if (options > 0) {
            draws.push({
                kind: "wheel",
                options,
                spins: history.length,
                at: last && typeof last.at === "number" ? last.at : null,
                href: "/tools/wheel-of-fortune",
            });
        }
    }

    return draws;
}
