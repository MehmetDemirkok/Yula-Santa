import { NextResponse } from 'next/server';

const giftSuggestions = {
  "uni-sex": {
    low: [
      { title: "Kahve/Çay Seti", description: "Kaliteli kahve veya çay ve aksesuar" },
      { title: "Alet Takımı", description: "Temel tamir ve bakım için mini alet takımı" },
      { title: "USB Şarj Cihazı", description: "Hızlı şarj özellikli USB-C şarj cihazı" },
      { title: "Kitap", description: "İlgi alanına göre best-seller kitap" },
      { title: "Spor Çorap Seti", description: "Rahat ve kaliteli spor çorap koleksiyonu" },
    ],
    medium: [
      { title: "Bluetooth Hoparlör", description: "Taşınabilir wireless hoparlör" },
      { title: "Fonksiyonel Sırt Çantası", description: "Günlük kullanım için modern tasarım" },
      { title: "Yazı Takımı", description: "Premium kalem ve Not defteri seti" },
      { title: "Masaj Cihazı", description: "El tipi masaj ve rahatlama cihazı" },
      { title: "Lüks Çikolata/Helva Kutusu", description: "Özel koleksiyon gourmet tatılılar" },
    ],
    high: [
      { title: "Akıllı Saat", description: "Fitness ve notification özellikli smartwatch" },
      { title: "Premium Kulaklık", description: "Gürültü engelleme ve uzun pil ömrü" },
      { title: "Dijital Kamera", description: "Taşınabilir action camera" },
      { title: "Lüks Saati", description: "Stil ve işlevselliği birleştiren klasik saat" },
      { title: "Premium Parfüm", description: "Seçkin marka kolon veya parfüm" },
    ]
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gender = "uni-sex", budget = "medium" } = body;

    const suggestions = giftSuggestions[gender as keyof typeof giftSuggestions]?.[budget as keyof typeof giftSuggestions["uni-sex"]] ||
                       giftSuggestions["uni-sex"][budget as keyof typeof giftSuggestions["uni-sex"]];

    const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    return NextResponse.json({
      suggestions: selected.map(s => ({
        title: s.title,
        description: s.description
      }))
    });
  } catch (error) {
    console.error('Gift suggestions error:', error);
    return NextResponse.json({
      suggestions: [
        { title: "Hediye Kartı", description: "Alıcının seçeceği şey için hediye kartı" }
      ]
    });
  }
}
