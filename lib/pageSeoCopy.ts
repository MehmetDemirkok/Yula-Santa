type Copy = { title: string; description: string };

const raffle: Record<string, Copy> = {
    tr: {
        title: 'İsim Çekilişi — Rastgele İsim Seçici | YulaSanta',
        description:
            'İsim listenizden adil kazanan ve yedek seçin. Ücretsiz isim çekilişi ve kura — kayıt ve şifre yok.',
    },
    en: {
        title: 'Name Picker — Random Name Draw | YulaSanta',
        description:
            'Pick fair winners and backups from any name list. Free online name raffle — no signup, no password.',
    },
    de: {
        title: 'Namensauslosung — Zufälliger Namenszieher | YulaSanta',
        description: 'Ziehen Sie Gewinner und Ersatz fair aus Ihrer Namensliste. Kostenlos, ohne Anmeldung.',
    },
    fr: {
        title: 'Tirage de noms — Sélecteur aléatoire | YulaSanta',
        description: 'Tirez des gagnants et des remplaçants depuis une liste. Gratuit, sans inscription.',
    },
    es: {
        title: 'Sorteo de nombres — Selector aleatorio | YulaSanta',
        description: 'Elige ganadores y suplentes de cualquier lista. Gratis, sin registro.',
    },
    it: {
        title: 'Estrazione nomi — Selettore casuale | YulaSanta',
        description: 'Scegli vincitori e riserve da un elenco. Gratis, senza registrazione.',
    },
    pt: {
        title: 'Sorteio de nomes — Seletor aleatório | YulaSanta',
        description: 'Escolha vencedores e reservas de qualquer lista. Grátis, sem cadastro.',
    },
    ru: {
        title: 'Розыгрыш имён — Случайный выбор | YulaSanta',
        description: 'Честно выбирайте победителей из списка имён. Бесплатно, без регистрации.',
    },
    ar: {
        title: 'سحب الأسماء — اختيار عشوائي | YulaSanta',
        description: 'اختر فائزين واحتياطيين من أي قائمة أسماء. مجاني وبدون تسجيل.',
    },
    ja: {
        title: '名前抽選 — ランダム名前ピッカー | YulaSanta',
        description: '名前リストから公平に当選者を選びます。無料・登録不要。',
    },
    ko: {
        title: '이름 추첨 — 무작위 이름 선택 | YulaSanta',
        description: '이름 목록에서 당첨자와 예비를 공정하게 뽑으세요. 무료, 가입 없음.',
    },
    zh: {
        title: '姓名抽奖 — 随机姓名选择器 | YulaSanta',
        description: '从名单中公平抽取获奖者和候补。免费，无需注册。',
    },
};

const secretSanta: Record<string, Copy> = {
    tr: {
        title: 'Online Secret Santa — Yılbaşı Çekilişi | YulaSanta',
        description:
            'Arkadaşlarını ekle, gizli eşleşme yap. Online Secret Santa ve yılbaşı çekilişi — kayıt yok, sonuç yalnızca sana görünür.',
    },
    en: {
        title: 'Online Secret Santa — Holiday Gift Draw | YulaSanta',
        description:
            'Add friends and match in secret. Free online Secret Santa — no signup, each person sees only their recipient.',
    },
    de: {
        title: 'Online Wichteln — Secret Santa | YulaSanta',
        description: 'Freunde hinzufügen und geheim zuordnen. Kostenloses Wichteln ohne Anmeldung.',
    },
    fr: {
        title: 'Père Noël Secret en ligne | YulaSanta',
        description: 'Ajoutez vos amis et associez-les en secret. Gratuit, sans inscription.',
    },
    es: {
        title: 'Amigo Invisible online | YulaSanta',
        description: 'Añade amigos y empareja en secreto. Gratis, sin registro.',
    },
    it: {
        title: 'Babbo Natale Segreto online | YulaSanta',
        description: 'Aggiungi amici e abbina in segreto. Gratis, senza registrazione.',
    },
    pt: {
        title: 'Amigo Secreto online | YulaSanta',
        description: 'Adicione amigos e combine em segredo. Grátis, sem cadastro.',
    },
    ru: {
        title: 'Тайный Санта онлайн | YulaSanta',
        description: 'Добавьте друзей и распределите подарки тайно. Бесплатно, без регистрации.',
    },
    ar: {
        title: 'سانتا السري عبر الإنترنت | YulaSanta',
        description: 'أضف الأصدقاء وقم بالمطابقة سراً. مجاني وبدون تسجيل.',
    },
    ja: {
        title: 'オンラインシークレットサンタ | YulaSanta',
        description: '友人を追加して秘密の組み合わせを作ります。無料・登録不要。',
    },
    ko: {
        title: '온라인 시크릿 산타 | YulaSanta',
        description: '친구를 추가하고 비밀로 짝을 지으세요. 무료, 가입 없음.',
    },
    zh: {
        title: '在线秘密圣诞老人 | YulaSanta',
        description: '添加好友并秘密配对。免费，无需注册。',
    },
};

const home: Record<string, Copy> = {
    tr: {
        title: 'YulaSanta — Ücretsiz Çekiliş Sitesi',
        description:
            'YouTube ve TikTok yorum çekilişi, isim çekilişi, Secret Santa, çarkıfelek ve daha fazlası. Kayıtsız, şifresiz, ücretsiz.',
    },
    en: {
        title: 'YulaSanta — Free Online Giveaway Tools',
        description:
            'YouTube and TikTok comment giveaways, name picker, Secret Santa, spin the wheel and more. Free, no signup, no password.',
    },
};

export function getPageSeoCopy(
    kind: 'raffle' | 'secretSanta' | 'home',
    locale: string
): Copy {
    const table = kind === 'raffle' ? raffle : kind === 'secretSanta' ? secretSanta : home;
    return table[locale] || table.en || raffle.en;
}

export const RAFFLE_H1: Record<string, string> = {
    tr: 'İsim çekilişi',
    en: 'Name picker',
    de: 'Namensauslosung',
    fr: 'Tirage de noms',
    es: 'Sorteo de nombres',
    it: 'Estrazione nomi',
    pt: 'Sorteio de nomes',
    ru: 'Розыгрыш имён',
    ar: 'سحب الأسماء',
    ja: '名前抽選',
    ko: '이름 추첨',
    zh: '姓名抽奖',
};

export const SECRET_SANTA_H1: Record<string, string> = {
    tr: 'Online Secret Santa',
    en: 'Online Secret Santa',
    de: 'Online Wichteln',
    fr: 'Père Noël Secret',
    es: 'Amigo Invisible',
    it: 'Babbo Natale Segreto',
    pt: 'Amigo Secreto',
    ru: 'Тайный Санта',
    ar: 'سانتا السري',
    ja: 'シークレットサンタ',
    ko: '시크릿 산타',
    zh: '秘密圣诞老人',
};
