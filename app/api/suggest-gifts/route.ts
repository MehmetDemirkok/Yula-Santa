import { NextResponse } from 'next/server';

const FALLBACK_GIFTS = [
    {
        title: "Kişiye Özel Kupa",
        description: "Sabah kahveleri için isminin baş harfi yazılı, şık bir seramik kupa."
    },
    {
        title: "Yılbaşı Temalı Çorap Kutusu",
        description: "Kış aylarında içini ısıtacak, renkli ve eğlenceli desenli çoraplar."
    },
    {
        title: "Minimalist Masa Takvimi",
        description: "Yeni yılda planlarını düzenli tutması için şık bir masa takvimi."
    },
    {
        title: "Bluetooth Hoparlör",
        description: "Müzik severler için taşınabilir ve kaliteli ses deneyimi sunan hoparlör."
    },
    {
        title: "Kitap Okuma Lambası",
        description: "Kitap okumayı sevenler için pratik ve göz yormayan ışık."
    }
];

export async function POST(request: Request) {
    try {
        const { budget, relationship } = await request.json();

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            console.log("No OpenAI API Key found, using fallback.");
            return NextResponse.json({ suggestions: FALLBACK_GIFTS });
        }

        try {
            const prompt = `
            You are a creative New Year gift expert. 
            Suggest 4 unique and thoughtful New Year gift ideas for a ${relationship || "friend"} 
            with a ${budget || "medium"} budget.
            Respond ONLY with a JSON object in this format:
            {
                "suggestions": [
                    { "title": "Gift Name", "description": "Short explanation (Turkish)" }
                ]
            }
            Ensure the descriptions are in Turkish, warm, and festive.
        `;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful assistant that outputs JSON." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API Error: ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch (e) {
                const match = content.match(/\{[\s\S]*\}/);
                if (match) {
                    parsed = JSON.parse(match[0]);
                } else {
                    throw new Error("Could not parse JSON");
                }
            }

            return NextResponse.json(parsed);

        } catch (error) {
            console.error("OpenAI request failed:", error);
            return NextResponse.json({ suggestions: FALLBACK_GIFTS });
        }

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
