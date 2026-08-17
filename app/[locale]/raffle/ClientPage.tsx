"use client";

import RaffleBoard from "@/components/RaffleBoard";
import { Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TITLE: Record<string, string> = {
    tr: "İsim çekilişi", en: "Name picker", de: "Namensauslosung",
    fr: "Tirage de noms", es: "Sorteo de nombres", it: "Estrazione nomi",
    pt: "Sorteio de nomes", ru: "Розыгрыш имён", ar: "سحب الأسماء",
    ja: "名前抽選", ko: "이름 추첨", zh: "姓名抽奖",
};

const SUBTITLE: Record<string, string> = {
    tr: "Listenizden adil kazanan ve yedek seçin. Ücretsiz kura — kayıt yok.",
    en: "Enter your list of names and instantly pick winners and backups with a fair, transparent draw.",
    de: "Geben Sie Ihre Namensliste ein und ermitteln Sie Gewinner und Ersatz mit einer fairen Auslosung.",
    fr: "Saisissez votre liste de noms et désignez instantanément les gagnants grâce à un tirage équitable.",
    es: "Introduce tu lista de nombres y elige ganadores y suplentes con un sorteo justo y transparente.",
    it: "Inserisci la tua lista di nomi e scegli vincitori e riserve con un'estrazione equa e trasparente.",
    pt: "Insira sua lista de nomes e escolha vencedores e suplentes com um sorteio justo e transparente.",
    ru: "Введите список имён и мгновенно выберите победителей честным и прозрачным розыгрышем.",
    ar: "أدخل قائمة الأسماء واختر الفائزين والاحتياطيين فوراً بسحب عادل وشفاف.",
    ja: "名前リストを入力し、公平で透明な抽選で当選者と補欠を即座に選びます。",
    ko: "이름 목록을 입력하고 공정하고 투명한 추첨으로 당첨자와 예비를 즉시 선택하세요.",
    zh: "输入名单，通过公平透明的抽奖即时选出获奖者和候补。",
};

export default function RaffleClient() {
    const { locale } = useLanguage();

    return (
        <RaffleBoard
            title={TITLE[locale] || TITLE.en}
            subtitle={SUBTITLE[locale] || SUBTITLE.en}
            icon={<Trophy className="w-8 h-8" />}
            accentBox="bg-gradient-to-tr from-santa-red to-red-500"
            accentButton="bg-santa-red hover:bg-red-700"
            accentGlow="bg-red-200 dark:bg-red-500/20"
            placeholder={locale === "tr" ? "İsim ekle" : "Add a name"}
            storageKey="generic_raffle_draft"
            shareSuffix="🎰 www.yulasanta.com.tr"
        />
    );
}
