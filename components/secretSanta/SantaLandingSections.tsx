import Link from 'next/link';
import {
    ArrowRight,
    Ban,
    Briefcase,
    FileSpreadsheet,
    Gift,
    GraduationCap,
    Link2,
    PartyPopper,
    Printer,
    School,
    ShieldCheck,
    Shuffle,
    UserX,
    Wallet,
} from 'lucide-react';
import { localePath } from '@/lib/localePath';

/**
 * Server-rendered sections under the /secret-santa tool: how it works, who it is
 * for, verified features and how data is handled. Turkish and English only;
 * other locales render nothing. Every claim must match the tool (see the header
 * of lib/secretSantaSeoCopy.ts).
 */
type Copy = {
    howTitle: string;
    steps: { title: string; desc: string }[];
    audienceTitle: string;
    audiences: { key: 'school' | 'university' | 'office' | 'friends'; title: string; desc: string; cta: string }[];
    featuresTitle: string;
    features: { key: keyof typeof FEATURE_ICONS; title: string; desc: string }[];
    trustTitle: string;
    trust: { q: string; a: string }[];
    privacyLink: string;
    finalTitle: string;
    finalCta: string;
};

const FEATURE_ICONS = {
    import: FileSpreadsheet,
    fair: Shuffle,
    rules: Ban,
    links: Link2,
    print: Printer,
    noSignup: UserX,
    free: Wallet,
};

const AUDIENCE = {
    school: { icon: School, path: '/secret-santa/classroom', tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
    university: { icon: GraduationCap, path: '/secret-santa/university', tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' },
    office: { icon: Briefcase, path: '/secret-santa/office', tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
    friends: { icon: PartyPopper, path: null, tone: 'bg-red-50 text-santa-red dark:bg-red-500/15' },
} as const;

const COPY: Record<string, Copy> = {
    tr: {
        howTitle: 'Nasıl çalışır?',
        steps: [
            { title: 'Katılımcıları ekle', desc: 'İsimleri tek tek yaz, toplu yapıştır ya da Excel, CSV veya PDF listesi yükle.' },
            { title: 'Çekilişi başlat', desc: 'İstersen birbirini çekmemesi gerekenleri seç, bütçe ve tarihi yaz. Kimse kendi adını çekmez.' },
            { title: 'Herkes kendi eşleşmesini öğrensin', desc: 'Herkese kişisel link gönder, aynı ekrandan sırayla baktır ya da katlanabilir kartları yazdırıp dağıt.' },
        ],
        audienceTitle: 'Kimler için?',
        audiences: [
            { key: 'school', title: 'Okullar ve Sınıflar', desc: 'Sınıf listesini yükleyin, her öğrenciye katlanınca sonucu gizleyen bir kart yazdırın. Telefon gerekmez.', cta: 'Öğretmenler için' },
            { key: 'university', title: 'Üniversiteler ve Öğrenci Kulüpleri', desc: 'Kulüp, bölüm veya yurt için herkes kendi linkini telefonundan açar.', cta: 'Öğrenciler için' },
            { key: 'office', title: 'Şirketler ve Ofisler', desc: 'Çalışan listesini Excel ile ekleyin, ekipleri gruplara ayırın, linkleri e-postayla gönderin.', cta: 'Ofisler için' },
            { key: 'friends', title: 'Arkadaş Grupları ve Aileler', desc: 'Herkes farklı şehirde olsa bile WhatsApp\'tan link gönderin; aynı evdekiler birbirini çekmesin.', cta: 'Hemen çekiliş yap' },
        ],
        featuresTitle: 'Özellikler',
        features: [
            { key: 'import', title: 'Excel ve CSV ile liste', desc: 'Listeyi dosyadan yükleyin; tekrar eden isimler atlanır.' },
            { key: 'fair', title: 'Adil rastgele eşleşme', desc: 'Eşleşmeler tarayıcının kriptografik rastgele sayı üreteciyle yapılır.' },
            { key: 'rules', title: 'Eş ve kardeş kuralları', desc: 'Belirli kişiler veya aynı gruptakiler birbirine çıkmaz.' },
            { key: 'links', title: 'Kişiye özel gizli link', desc: 'Mesajda kimi çektiği yazmaz; sonucu yalnızca linki açan görür.' },
            { key: 'print', title: 'Yazdırılabilir kartlar', desc: 'Bir A4 sayfaya 5 katlanabilir kart sığar.' },
            { key: 'noSignup', title: 'Kayıt gerekmez', desc: 'Ne organizatörün ne de katılımcıların hesap açması gerekir.' },
            { key: 'free', title: 'Tamamen ücretsiz', desc: 'Ödeme veya abonelik yoktur.' },
        ],
        trustTitle: 'Gizlilik ve güven',
        trust: [
            { q: 'Veriler nerede işleniyor?', a: 'İsimler ve eşleşmeler sizin tarayıcınızda hesaplanır ve saklanır; sunucumuza gönderilmez. Excel ve CSV dosyaları da tarayıcıda okunur. Yalnızca PDF yüklerseniz dosya, isimleri çıkarmak için sunucuda işlenir ve kaydedilmez.' },
            { q: 'Kayıt olmak gerekiyor mu?', a: 'Hayır. Çekilişi yapmak da sonucu görmek de hesap gerektirmez.' },
            { q: 'Kişisel linkler nasıl çalışır?', a: 'Eşleşme, linkin # işaretinden sonraki kısmında durur. Bu kısım sunucuya, kayıtlara veya istatistiklere gitmez. Şifreli değildir: linki açan herkes sonucu görür ve linkleri oluşturan organizatör de açabilir. Bu yüzden her linki yalnızca sahibine gönderin.' },
            { q: 'İstatistik tutuyor musunuz?', a: 'Yalnızca sayfa adresini ve katılımcı sayısını sayarız. İsimler, eşleşmeler ve ipuçları bu kayıtlara girmez.' },
        ],
        privacyLink: 'Gizlilik politikasının tamamı →',
        finalTitle: 'Yılbaşı çekilişine hazır mısın?',
        finalCta: 'Ücretsiz Çekiliş Yap',
    },
    en: {
        howTitle: 'How it works',
        steps: [
            { title: 'Add participants', desc: 'Type names one by one, paste a list or upload an Excel, CSV or PDF file.' },
            { title: 'Start the draw', desc: 'Optionally pick who must not draw each other and add a budget and date. Nobody draws themselves.' },
            { title: 'Everyone finds out their match', desc: 'Send everyone a personal link, take turns on one screen or print fold-over cards to hand out.' },
        ],
        audienceTitle: 'Who it is for',
        audiences: [
            { key: 'school', title: 'Schools and classrooms', desc: 'Upload the class list and print a fold-over card for every student that hides the result. No phones needed.', cta: 'For teachers' },
            { key: 'university', title: 'Universities and student clubs', desc: 'For clubs, departments or dorms: everyone opens their own link on their phone.', cta: 'For students' },
            { key: 'office', title: 'Companies and offices', desc: 'Import the staff list from Excel, group teams and send the links by e-mail.', cta: 'For offices' },
            { key: 'friends', title: 'Friends and families', desc: 'Send links on WhatsApp even if everyone lives in a different city, and keep households apart.', cta: 'Start a draw' },
        ],
        featuresTitle: 'Features',
        features: [
            { key: 'import', title: 'Excel and CSV import', desc: 'Upload the list from a file; duplicate names are skipped.' },
            { key: 'fair', title: 'Fair random matching', desc: "Matches use the browser's cryptographic random number generator." },
            { key: 'rules', title: 'Couple and sibling rules', desc: 'Chosen pairs and people in the same group are never matched.' },
            { key: 'links', title: 'Private personal links', desc: "The message doesn't say who they drew; only whoever opens the link sees it." },
            { key: 'print', title: 'Printable cards', desc: 'Five fold-over cards fit on an A4 page.' },
            { key: 'noSignup', title: 'No sign-up', desc: 'Neither the organizer nor the participants need an account.' },
            { key: 'free', title: 'Completely free', desc: 'No payment or subscription.' },
        ],
        trustTitle: 'Privacy and trust',
        trust: [
            { q: 'Where is the data processed?', a: 'Names and matches are computed and stored in your browser and are not sent to our server. Excel and CSV files are read in the browser too. Only a PDF upload is processed on our server, to extract the names, and it is not saved.' },
            { q: 'Do I need to sign up?', a: 'No. Neither running the draw nor seeing a result needs an account.' },
            { q: 'How do personal links work?', a: "The match sits after the # in the link. That part never reaches our server, logs or statistics. It is not encrypted: anyone who opens the link sees the result, and the organizer who created the links could open them. So send each link only to its owner." },
            { q: 'Do you collect statistics?', a: 'We count only the page address and the number of participants. Names, matches and hints never enter those records.' },
        ],
        privacyLink: 'Read the full privacy notice →',
        finalTitle: 'Ready for your gift exchange?',
        finalCta: 'Start a free draw',
    },
};

export default function SantaLandingSections({ locale }: { locale: string }) {
    const copy = COPY[locale];
    if (!copy) return null;
    const h2 = 'font-heading text-xl sm:text-2xl font-bold text-[var(--text-primary)]';

    return (
        <div className="border-t border-[var(--border-light)]">
            <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-10 sm:py-12">
                <section id="nasil-calisir" aria-labelledby="santa-how" className="scroll-mt-[96px] space-y-5">
                    <h2 id="santa-how" className={`${h2} text-center`}>{copy.howTitle}</h2>
                    <ol className="grid gap-3 sm:grid-cols-3">
                        {copy.steps.map((step, i) => (
                            <li key={step.title} className="ys-card p-5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-santa-red text-base font-bold text-white">{i + 1}</span>
                                <h3 className="mt-3 font-bold text-[var(--text-primary)]">{step.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section aria-labelledby="santa-audience" className="space-y-5">
                    <h2 id="santa-audience" className={`${h2} text-center`}>{copy.audienceTitle}</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {copy.audiences.map((item) => {
                            const meta = AUDIENCE[item.key];
                            const Icon = meta.icon;
                            const href = meta.path ? localePath(locale, meta.path) : '#cekilis';
                            return (
                                <li key={item.key} className="ys-card flex flex-col p-5">
                                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.tone}`} aria-hidden>
                                        <Icon className="h-6 w-6" />
                                    </span>
                                    <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
                                    <p className="mt-1 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">{item.desc}</p>
                                    <Link href={href} className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 self-start text-sm font-bold text-santa-red hover:underline">
                                        {item.cta} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby="santa-features" className="space-y-5">
                    <h2 id="santa-features" className={`${h2} text-center`}>{copy.featuresTitle}</h2>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {copy.features.map((feature) => {
                            const Icon = FEATURE_ICONS[feature.key];
                            return (
                                <li key={feature.key} className="flex items-start gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] p-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-santa-red dark:bg-red-500/15" aria-hidden>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-[var(--text-primary)]">{feature.title}</span>
                                        <span className="block text-sm text-[var(--text-secondary)]">{feature.desc}</span>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby="santa-trust" className="ys-card space-y-4 p-5 sm:p-6">
                    <h2 id="santa-trust" className={`${h2} flex items-center gap-2`}>
                        <ShieldCheck className="h-6 w-6 shrink-0 text-success-green" aria-hidden /> {copy.trustTitle}
                    </h2>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        {copy.trust.map((item) => (
                            <div key={item.q}>
                                <dt className="font-bold text-[var(--text-primary)]">{item.q}</dt>
                                <dd className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</dd>
                            </div>
                        ))}
                    </dl>
                    <Link href={localePath(locale, '/privacy')} className="inline-flex min-h-[44px] items-center text-sm font-bold text-santa-red hover:underline">
                        {copy.privacyLink}
                    </Link>
                </section>

                <section className="space-y-4 text-center">
                    <h2 className={h2}>{copy.finalTitle}</h2>
                    <a
                        href="#cekilis"
                        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-santa-red px-7 text-base font-bold text-white shadow-lg shadow-red-200/50 hover:brightness-110 dark:shadow-red-900/30"
                    >
                        <Gift className="h-5 w-5" aria-hidden /> {copy.finalCta}
                    </a>
                </section>
            </div>
        </div>
    );
}
