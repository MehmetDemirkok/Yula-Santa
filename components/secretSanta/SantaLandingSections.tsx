import Link from 'next/link';
import {
    ArrowRight,
    Ban,
    ChevronDown,
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
import { SantaMascot } from '@/components/secretSanta/SantaMascot';

/**
 * Server-rendered sections under the /secret-santa tool: how it works, who it is
 * for, verified features and how data is handled. Turkish, English and Russian
 * only; other locales render nothing. Every claim must match the tool (see the header
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
    preview: Preview;
    trust: { q: string; a: string; more?: string }[];
    moreLabel: string;
    privacyLink: string;
    finalTitle: string;
    finalCta: string;
};

/** Sample content for the "what participants see" mock-ups; mirrors the real link message, /s page and printed card. */
type Preview = {
    title: string;
    intro: string;
    linkTitle: string;
    linkDesc: string;
    message: string;
    url: string;
    giftFor: string;
    giver: string;
    receiver: string;
    hint: string;
    budget: string;
    date: string;
    cardTitle: string;
    cardDesc: string;
    cardPrivate: string;
    cardPattern: string;
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
            { key: 'import', title: 'Excel ve CSV ile liste', desc: 'Dosyadan yükle, tekrar eden isimler atlanır.' },
            { key: 'fair', title: 'Adil eşleşme', desc: 'Eşleşmeler tamamen rastgele yapılır.' },
            { key: 'rules', title: 'Eş ve kardeş kuralları', desc: 'Seçtiğin kişiler birbirine çıkmaz.' },
            { key: 'links', title: 'Kişiye özel link', desc: 'Sonucu yalnızca linki açan görür.' },
            { key: 'print', title: 'Yazdırılabilir kartlar', desc: 'A4 sayfaya 5 katlanır kart sığar.' },
            { key: 'noSignup', title: 'Kayıt yok', desc: 'Ne sen ne de katılımcılar hesap açar.' },
            { key: 'free', title: 'Tamamen ücretsiz', desc: 'Ödeme ya da abonelik yok.' },
        ],
        preview: {
            title: 'Katılımcılar ne görüyor?',
            intro: 'Sonucu herkese link olarak gönderebilir ya da kart olarak yazdırabilirsin.',
            linkTitle: 'WhatsApp\'tan gelen link',
            linkDesc: 'Mesajda kimi çektiği yazmaz. Linke dokununca yalnızca kendi sonucunu görür.',
            message: '🎁 Merhaba Ayşe! Yılbaşı hediye çekilişinin sonucu hazır. Kime hediye alacağını görmek için linke dokun:',
            url: 'yulasanta.com.tr/s#…',
            giftFor: 'Hediye alacağın kişi',
            giver: 'Ayşe',
            receiver: 'Mehmet',
            hint: 'Kahveye bayılır',
            budget: 'Bütçe: 500 TL',
            date: '31 Aralık',
            cardTitle: 'Yazdırılan kart',
            cardDesc: 'Telefonu olmayan sınıflar için. Kartı katlayınca sonuç görünmez, ışığa tutsan bile okunmaz.',
            cardPrivate: 'Bu kart sana özel 🤫',
            cardPattern: 'Gizlilik deseni',
        },
        trustTitle: 'Gizlilik ve güven',
        trust: [
            { q: 'Veriler nerede işleniyor?', a: 'İsimler ve eşleşmeler senin tarayıcında kalır, sunucumuza gönderilmez.', more: 'Excel ve CSV dosyaları da tarayıcıda okunur. Yalnızca PDF yüklersen dosya, isimleri çıkarmak için sunucuda işlenir ve kaydedilmez.' },
            { q: 'Kayıt olmak gerekiyor mu?', a: 'Hayır. Ne çekiliş için ne de sonucu görmek için hesap gerekir.' },
            { q: 'Kişisel linkler güvenli mi?', a: 'Sonucu yalnızca linki açan kişi görür. Bu yüzden her linki sadece sahibine gönder.', more: 'Eşleşme, linkin # işaretinden sonraki kısmında durur. Bu kısım sunucumuza, kayıtlara ve istatistiklere gitmez. Link şifreli değildir: linkleri oluşturan organizatör de birinin linkini açarsa onun sonucunu görür.' },
            { q: 'İstatistik tutuyor musunuz?', a: 'Sadece kaç çekiliş yapıldığını ve linklerin açılıp açılmadığını sayarız. İsimler ve eşleşmeler kaydedilmez.', more: 'Kayıtlarda sayfa adresi, katılımcı sayısı ve "link açıldı" gibi adımlar bulunur. İsimler, eşleşmeler ve ipuçları bu kayıtlara girmez.' },
        ],
        moreLabel: 'Ayrıntılar',
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
            { key: 'import', title: 'Excel and CSV import', desc: 'Upload a file; duplicates are skipped.' },
            { key: 'fair', title: 'Fair matching', desc: 'Every match is completely random.' },
            { key: 'rules', title: 'Couple and sibling rules', desc: 'People you pick never draw each other.' },
            { key: 'links', title: 'Personal links', desc: 'Only the person who opens a link sees it.' },
            { key: 'print', title: 'Printable cards', desc: 'Five fold-over cards per A4 page.' },
            { key: 'noSignup', title: 'No sign-up', desc: 'Nobody needs an account.' },
            { key: 'free', title: 'Completely free', desc: 'No payment or subscription.' },
        ],
        preview: {
            title: 'What participants see',
            intro: 'Send everyone a link, or print the results as cards.',
            linkTitle: 'A link on WhatsApp',
            linkDesc: "The message doesn't say who they drew. Tapping the link shows only their own match.",
            message: '🎁 Hi Emma! The Secret Santa draw is ready. Tap the link to see who you are buying a gift for:',
            url: 'yulasanta.com.tr/en/s#…',
            giftFor: "You're buying a gift for",
            giver: 'Emma',
            receiver: 'Liam',
            hint: 'Loves good coffee',
            budget: 'Budget: $25',
            date: 'Dec 20',
            cardTitle: 'A printed card',
            cardDesc: 'For classrooms without phones. Once folded, the result stays hidden, even held up to the light.',
            cardPrivate: 'This card is just for you 🤫',
            cardPattern: 'Privacy pattern',
        },
        trustTitle: 'Privacy and trust',
        trust: [
            { q: 'Where is the data processed?', a: 'Names and matches stay in your browser and are not sent to our server.', more: 'Excel and CSV files are read in the browser too. Only a PDF upload is processed on our server, to extract the names, and it is not saved.' },
            { q: 'Do I need to sign up?', a: 'No. Neither running the draw nor seeing a result needs an account.' },
            { q: 'Are personal links safe?', a: 'Only the person who opens a link sees the result, so send each link only to its owner.', more: "The match sits after the # in the link. That part never reaches our server, logs or statistics. It is not encrypted: if the organizer who created the links opens someone's link, they see that result." },
            { q: 'Do you collect statistics?', a: 'We only count how many draws happen and whether links were opened. Names and matches are never recorded.', more: 'The records hold the page address, the number of participants and steps such as "link opened". Names, matches and hints never enter them.' },
        ],
        moreLabel: 'Details',
        privacyLink: 'Read the full privacy notice →',
        finalTitle: 'Ready for your gift exchange?',
        finalCta: 'Start a free draw',
    },
    ru: {
        howTitle: 'Как это работает',
        steps: [
            { title: 'Добавьте участников', desc: 'Вводите имена по одному, вставьте список или загрузите файл Excel, CSV или PDF.' },
            { title: 'Запустите жеребьёвку', desc: 'При желании выберите, кто не должен вытянуть друг друга, и укажите бюджет и дату. Никто не вытягивает сам себя.' },
            { title: 'Каждый узнаёт свою пару', desc: 'Отправьте каждому личную ссылку, смотрите по очереди на одном экране или распечатайте складные карточки.' },
        ],
        audienceTitle: 'Для кого',
        audiences: [
            { key: 'school', title: 'Школы и классы', desc: 'Загрузите список класса и распечатайте для каждого ученика складную карточку, скрывающую результат. Телефоны не нужны.', cta: 'Для учителей' },
            { key: 'university', title: 'Университеты и студенческие клубы', desc: 'Для клуба, факультета или общежития: каждый открывает свою ссылку на телефоне.', cta: 'Для студентов' },
            { key: 'office', title: 'Компании и офисы', desc: 'Загрузите список сотрудников из Excel, объедините отделы в группы и разошлите ссылки по почте.', cta: 'Для офисов' },
            { key: 'friends', title: 'Друзья и семьи', desc: 'Отправляйте ссылки в WhatsApp, даже если все живут в разных городах, и разводите тех, кто живёт вместе.', cta: 'Начать жеребьёвку' },
        ],
        featuresTitle: 'Возможности',
        features: [
            { key: 'import', title: 'Импорт из Excel и CSV', desc: 'Загрузите файл, повторы пропускаются.' },
            { key: 'fair', title: 'Честный подбор', desc: 'Все пары составляются случайно.' },
            { key: 'rules', title: 'Правила для пар и родственников', desc: 'Выбранные люди не вытянут друг друга.' },
            { key: 'links', title: 'Личные ссылки', desc: 'Результат видит только тот, кто открыл ссылку.' },
            { key: 'print', title: 'Карточки для печати', desc: 'Пять складных карточек на листе A4.' },
            { key: 'noSignup', title: 'Без регистрации', desc: 'Аккаунт никому не нужен.' },
            { key: 'free', title: 'Полностью бесплатно', desc: 'Никаких платежей и подписок.' },
        ],
        preview: {
            title: 'Что видят участники',
            intro: 'Отправьте каждому ссылку или распечатайте результаты на карточках.',
            linkTitle: 'Ссылка в WhatsApp',
            linkDesc: 'В сообщении не написано, кто кому достался. По ссылке человек видит только свою пару.',
            message: '🎁 Привет, Анна! Жеребьёвка Тайного Санты готова. Нажми на ссылку, чтобы узнать, кому ты даришь подарок:',
            url: 'yulasanta.com.tr/ru/s#…',
            giftFor: 'Ты даришь подарок',
            giver: 'Анна',
            receiver: 'Иван',
            hint: 'Обожает кофе',
            budget: 'Бюджет: 2000 ₽',
            date: '30 декабря',
            cardTitle: 'Карточка для печати',
            cardDesc: 'Для классов без телефонов. В сложенном виде результат не виден даже на просвет.',
            cardPrivate: 'Эта карточка только для тебя 🤫',
            cardPattern: 'Защитный узор',
        },
        trustTitle: 'Конфиденциальность и доверие',
        trust: [
            { q: 'Где обрабатываются данные?', a: 'Имена и пары остаются в вашем браузере и не отправляются на наш сервер.', more: 'Файлы Excel и CSV тоже читаются в браузере. Только загруженный PDF обрабатывается на нашем сервере, чтобы извлечь имена, и не сохраняется.' },
            { q: 'Нужна ли регистрация?', a: 'Нет. Аккаунт не нужен ни для жеребьёвки, ни для просмотра результата.' },
            { q: 'Безопасны ли личные ссылки?', a: 'Результат видит только тот, кто открыл ссылку, поэтому отправляйте каждую ссылку только её владельцу.', more: 'Пара записана после знака # в ссылке. Эта часть никогда не попадает на наш сервер, в журналы или статистику. Ссылка не зашифрована: если организатор, создавший ссылки, откроет чужую ссылку, он увидит этот результат.' },
            { q: 'Вы собираете статистику?', a: 'Мы считаем только количество жеребьёвок и то, открывались ли ссылки. Имена и пары не записываются.', more: 'В записях есть адрес страницы, число участников и такие шаги, как «ссылка открыта». Имена, пары и подсказки туда не попадают.' },
        ],
        moreLabel: 'Подробнее',
        privacyLink: 'Читать полную политику конфиденциальности →',
        finalTitle: 'Готовы к обмену подарками?',
        finalCta: 'Провести бесплатную жеребьёвку',
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

                <ResultPreview copy={copy.preview} />

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
                                <dd className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                                    {item.a}
                                    {item.more && (
                                        <details className="group mt-1">
                                            <summary className="inline-flex min-h-[32px] cursor-pointer list-none items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:text-santa-red [&::-webkit-details-marker]:hidden">
                                                {copy.moreLabel}
                                                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
                                            </summary>
                                            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">{item.more}</p>
                                        </details>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <Link href={localePath(locale, '/privacy')} className="inline-flex min-h-[44px] items-center text-sm font-bold text-santa-red hover:underline">
                        {copy.privacyLink}
                    </Link>
                </section>

                <section className="space-y-4 text-center">
                    <SantaMascot />
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

/** Static mock-ups of the WhatsApp message, the /s reveal and a printed card, with sample names. */
function ResultPreview({ copy }: { copy: Preview }) {
    return (
        <section aria-labelledby="santa-preview" className="space-y-5">
            <div className="space-y-1 text-center">
                <h2 id="santa-preview" className="font-heading text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{copy.title}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{copy.intro}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <figure className="ys-card flex flex-col p-5">
                    <div aria-hidden className="flex-1 space-y-3 rounded-2xl bg-[#EFE7DD] p-4 dark:bg-[#0B141A]">
                        <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-start text-[13px] leading-snug text-zinc-800 shadow-sm dark:bg-[#202C33] dark:text-zinc-100">
                            {copy.message}
                            <span className="mt-1 block font-medium text-[#027EB5] dark:text-[#53BDEB]">{copy.url}</span>
                        </div>
                        <div className="ms-auto max-w-[80%] rounded-2xl border border-[var(--border-light)] bg-[var(--card-bg)] p-4 text-center shadow-md">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{copy.giftFor}</p>
                            <p className="mt-1 font-heading text-2xl font-extrabold text-santa-red">{copy.receiver}</p>
                            <p className="mt-2 text-[12px] text-[var(--text-secondary)]">💡 {copy.hint}</p>
                            <div className="mt-2 flex flex-wrap justify-center gap-1.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">{copy.budget}</span>
                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5">{copy.date}</span>
                            </div>
                        </div>
                    </div>
                    <figcaption className="mt-4">
                        <span className="flex items-center gap-2 font-bold text-[var(--text-primary)]"><Link2 className="h-4 w-4 text-santa-red" aria-hidden /> {copy.linkTitle}</span>
                        <span className="mt-1 block text-sm text-[var(--text-secondary)]">{copy.linkDesc}</span>
                    </figcaption>
                </figure>

                <figure className="ys-card flex flex-col p-5">
                    <div aria-hidden className="flex flex-1 items-center justify-center rounded-2xl bg-[var(--surface-2)] p-4">
                        <div className="grid w-full max-w-[360px] grid-cols-3 overflow-hidden rounded-md border border-zinc-300 bg-white text-zinc-800 shadow-md dark:border-zinc-600">
                            <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
                                <Gift className="h-5 w-5 text-santa-red" />
                                <span className="font-heading text-base font-extrabold">{copy.giver}</span>
                                <span className="text-[9px] leading-tight text-zinc-500">{copy.cardPrivate}</span>
                            </div>
                            <div className="flex items-end justify-center border-x border-dashed border-zinc-300 bg-[repeating-linear-gradient(45deg,#d4d4d8_0_4px,#f4f4f5_4px_8px)] p-1.5">
                                <span className="rounded bg-white/90 px-1 text-[8px] font-semibold text-zinc-500">{copy.cardPattern}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-0.5 p-2 text-center">
                                <span className="text-[9px] font-bold uppercase leading-tight text-zinc-500">{copy.giftFor}</span>
                                <span className="font-heading text-base font-extrabold text-santa-red">{copy.receiver}</span>
                            </div>
                        </div>
                    </div>
                    <figcaption className="mt-4">
                        <span className="flex items-center gap-2 font-bold text-[var(--text-primary)]"><Printer className="h-4 w-4 text-santa-red" aria-hidden /> {copy.cardTitle}</span>
                        <span className="mt-1 block text-sm text-[var(--text-secondary)]">{copy.cardDesc}</span>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
