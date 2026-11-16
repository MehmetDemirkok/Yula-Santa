import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import { CAMPAIGNS, displayUrl, wrapText } from "../../lib/marketing/campaigns";
import { parseCollectPayload } from "../../lib/analytics/events";

describe("wrapText", () => {
    it("keeps words whole and respects the limit", () => {
        assert.deepEqual(wrapText("Yılbaşı Hediye Çekilişini Dakikalar İçinde Yap!", 18), ["Yılbaşı Hediye", "Çekilişini", "Dakikalar İçinde", "Yap!"]);
    });

    it("honors manual line breaks and skips empty lines", () => {
        assert.deepEqual(wrapText("Bir\n\nİki üç", 40), ["Bir", "İki üç"]);
    });

    it("puts a word longer than the limit on its own line", () => {
        assert.deepEqual(wrapText("a çokuzunbirkelime b", 5), ["a", "çokuzunbirkelime", "b"]);
    });
});

describe("campaigns", () => {
    it("prints short URLs under the QR code", () => {
        assert.equal(displayUrl("https://www.yulasanta.com.tr/ofis-yilbasi-cekilisi"), "yulasanta.com.tr/ofis-yilbasi-cekilisi");
    });

    it("every campaign URL encodes as a QR code on the site", () => {
        for (const campaign of CAMPAIGNS) {
            assert.match(campaign.url, /^https:\/\/www\.yulasanta\.com\.tr\//);
            assert.ok(QRCode.create(campaign.url, { errorCorrectionLevel: "M" }).modules.size > 20);
        }
    });
});

describe("funnel events", () => {
    it("accepts the new event names with a tool and nothing else", () => {
        const payload = parseCollectPayload({
            consent: "unset",
            events: ["cta_click", "list_imported", "card_printed", "whatsapp_share", "qr_generated"].map((name) => ({
                name,
                path: "/secret-santa?d=secret",
                tool: "secret_santa",
                note: "Elif",
            })),
        });
        assert.ok(payload);
        assert.equal(payload.events.length, 5);
        for (const event of payload.events) {
            assert.equal(event.path, "/secret-santa");
            assert.equal(event.tool, "secret_santa");
            assert.equal("note" in event, false);
        }
    });

    it("still rejects unknown event names", () => {
        assert.equal(parseCollectPayload({ events: [{ name: "participant_named", path: "/" }] }), null);
    });
});
