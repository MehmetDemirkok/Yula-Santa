import { getTranslations } from 'next-intl/server';
import { getSEOMetadata, viewport } from '@/lib/seo';
export { viewport };
import { ShieldAlert, ShieldCheck, Trophy, Users } from 'lucide-react';
import { getGiveaway, isGiveawayStoreConfigured } from '@/lib/tiktok/giveawayStore';
import { isValidGiveawayId } from '@/lib/tiktok/giveawayId';
import { SITE_NAME } from '@/lib/constants';

type PageParams = { locale: string; id: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }) {
    const { locale, id } = await params;
    return getSEOMetadata({
        locale,
        path: `/verify/${id}`,
        titleOverride: `Çekiliş Doğrulama · ${id} | YulaSanta`,
        descriptionOverride: 'YulaSanta TikTok çekiliş sonucunu buradan doğrulayabilirsiniz.',
        noIndex: true,
    });
}

export default async function VerifyPage({ params }: { params: Promise<PageParams> }) {
    const { locale, id } = await params;
    const t = await getTranslations({ locale, namespace: 'giveaway' });

    const giveaway =
        isGiveawayStoreConfigured() && isValidGiveawayId(id) ? await getGiveaway(id).catch(() => null) : null;
    const result = giveaway && giveaway.status === 'drawn' ? giveaway.result : null;

    if (!giveaway || !result) {
        return (
            <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
                <ShieldAlert className="mb-4 h-12 w-12 text-amber-500" />
                <h1 className="text-2xl font-bold tracking-tight">{t('proofPageTitle')}</h1>
                <p className="mt-3 text-[var(--text-secondary)]">{t('proofPageInvalid')}</p>
            </main>
        );
    }

    const drawnAt = new Date(giveaway.drawnAt || result.at);

    return (
        <main className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
            <div className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[0_8px_40px_rgba(17,24,39,0.06)] dark:bg-[var(--card-bg)] sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                        <ShieldCheck className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{SITE_NAME}</p>
                        <h1 className="text-2xl font-bold tracking-tight">✓ {t('proofPageTitle')}</h1>
                    </div>
                </div>

                <p className="mb-6 text-[var(--text-secondary)]">{t('proofPageSubtitle')}</p>

                <h2 className="text-xl font-bold">TikTok · {giveaway.id}</h2>
                <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{giveaway.videoUrl}</p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-[var(--surface-2)] p-3">
                        <dt className="text-xs text-[var(--text-muted)]">{t('proofDrawnAt')}</dt>
                        <dd className="font-medium">{drawnAt.toLocaleString(locale)}</dd>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-2)] p-3">
                        <dt className="text-xs text-[var(--text-muted)]">{t('proofEligible')}</dt>
                        <dd className="font-medium">
                            {result.eligible} / {result.total}
                        </dd>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-2)] p-3 sm:col-span-2">
                        <dt className="text-xs text-[var(--text-muted)]">{t('proofSeed')}</dt>
                        <dd className="break-all font-mono text-xs">{result.seed}</dd>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-2)] p-3 sm:col-span-2">
                        <dt className="text-xs text-[var(--text-muted)]">{t('proofAlgorithm')}</dt>
                        <dd>
                            crypto Fisher–Yates · {giveaway.settings.countUserOnce ? t('proofDedupeOn') : t('proofDedupeOff')}
                            {giveaway.settings.keyword ? ` · ${t('proofKeyword')}: “${giveaway.settings.keyword}”` : ''}
                        </dd>
                    </div>
                </dl>

                <div className="mt-8 space-y-3">
                    <h3 className="flex items-center gap-2 font-semibold">
                        <Trophy className="h-4 w-4 text-amber-500" /> {t('winners')}
                    </h3>
                    {result.winners.map((w, i) => (
                        <div key={`${w.name}-${i}`} className="rounded-xl border border-[var(--border-light)] px-4 py-3">
                            <p className="font-bold">
                                {i + 1}. @{w.name}
                            </p>
                            {w.comment && <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2">{w.comment}</p>}
                        </div>
                    ))}
                </div>

                {result.backups.length > 0 && (
                    <div className="mt-8 space-y-2">
                        <h3 className="flex items-center gap-2 font-semibold text-[var(--text-muted)]">
                            <Users className="h-4 w-4" /> {t('backups')}
                        </h3>
                        {result.backups.map((b, i) => (
                            <p key={`${b.name}-${i}`} className="text-sm text-[var(--text-secondary)]">
                                {i + 1}. @{b.name}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
