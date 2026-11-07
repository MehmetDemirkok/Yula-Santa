/**
 * Plaka Avcısı — FAQ copy (client-safe).
 * Shared by the on-page FAQ and the FAQPage structured data so the schema
 * always matches visible content.
 */

import { DAILY_QUESTION_COUNT, STANDARD_QUESTION_COUNT } from './game';

export type PlakaFaqItem = { question: string; answer: string };

export const PLAKA_FAQ: PlakaFaqItem[] = [
    {
        question: 'Plaka Avcısı ücretsiz mi?',
        answer: 'Evet. Plaka Avcısı tamamen ücretsizdir; üyelik, ödeme veya uygulama indirmesi gerekmez. Misafir olarak hemen oynayabilirsin.',
    },
    {
        question: 'Hangi oyun modları var?',
        answer: `Dört mod bulunur: Plakadan Şehri Bul, Şehirden Plakayı Bul, 60 saniyelik Zamana Karşı ve İpuçlarından Şehri Bul. Süresiz modlarda bir tur ${STANDARD_QUESTION_COUNT} sorudur; her modda kolay, orta, zor veya karışık seviye seçebilirsin.`,
    },
    {
        question: 'Puanlar nasıl hesaplanıyor?',
        answer: 'Doğru cevaplar seviyeye göre 10, 20 veya 30 puan kazandırır. Üçüncü üst üste doğru cevaptan itibaren kombo bonusu eklenir (en fazla +25). Tüm cevaplar ve puanlar sunucuda doğrulanır.',
    },
    {
        question: 'Misafir olarak oynayabilir miyim?',
        answer: 'Evet. Misafirken skorların anonim bir avcı kimliğiyle saklanır ve liderlik tablosunda görünür. İstersen oyun başında bir avcı adı belirleyebilirsin.',
    },
    {
        question: 'Günün meydan okuması nedir?',
        answer: `Her gün herkese aynı ${DAILY_QUESTION_COUNT} plaka sorusu sorulur. Günde tek deneme yapılır ve skorun Meydan Okuma tablosuna işlenir.`,
    },
];
