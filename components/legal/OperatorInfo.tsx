import { OPERATOR } from '@/lib/legal/operator';

type Labels = { name: string; address: string; email: string; website: string };

/** The site operator's identity. Fields left empty in lib/legal/operator.ts are hidden. */
export function OperatorInfo({ labels }: { labels: Labels }) {
    const rows = [
        { label: labels.name, value: OPERATOR.name },
        { label: labels.address, value: OPERATOR.address },
        { label: labels.email, value: OPERATOR.email, href: `mailto:${OPERATOR.email}` },
        { label: labels.website, value: OPERATOR.website },
    ].filter((row) => row.value);

    return (
        <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-body-md">
            {rows.map((row) => (
                <div key={row.label} className="contents">
                    <dt className="font-bold text-[var(--text-primary)]">{row.label}</dt>
                    <dd className="text-[var(--text-secondary)] break-words">
                        {row.href ? (
                            <a href={row.href} className="text-indigo-accent hover:underline">
                                {row.value}
                            </a>
                        ) : (
                            row.value
                        )}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
