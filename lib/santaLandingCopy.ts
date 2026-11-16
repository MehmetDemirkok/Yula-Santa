/**
 * Shared shape for the Secret Santa audience landing pages (classroom, office,
 * university). Every claim in the copy must match how the tool works; see the
 * header of lib/secretSantaSeoCopy.ts for the list of verified features.
 */
export type SantaLandingSample = {
    brand: string;
    giver: string;
    cardFor: string;
    pattern: string;
    giftFor: string;
    receiver: string;
    hint: string;
};

export type SantaLandingCopy = {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    h1: string;
    intro: string;
    cta: string;
    sampleTitle?: string;
    sample?: SantaLandingSample;
    whyTitle: string;
    why: { title: string; desc: string }[];
    howToTitle: string;
    steps: string[];
    /** Optional "how your data is handled" block. */
    privacyTitle?: string;
    privacy?: string[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    breadcrumb: string;
    relatedTitle?: string;
    related?: { path: string; label: string }[];
};
