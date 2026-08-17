import Link from 'next/link';
import { localePath } from '@/lib/localePath';

export type RelatedLinkItem = { path: string; label: string };

export default function RelatedLinks({
    locale,
    title,
    items,
}: {
    locale: string;
    title: string;
    items: RelatedLinkItem[];
}) {
    if (items.length === 0) return null;

    return (
        <nav aria-label={title} className="pt-4">
            <h2 className="font-heading text-xl tracking-tight text-[var(--text-primary)] mb-4">
                {title}
            </h2>
            <ul className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <li key={item.path}>
                        <Link
                            href={localePath(locale, item.path)}
                            className="inline-flex rounded-full border border-[var(--border-light)] bg-[var(--card-bg)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-santa-red/40 hover:text-[var(--text-primary)] transition-colors"
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
