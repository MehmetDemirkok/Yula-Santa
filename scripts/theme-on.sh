#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Yılbaşı Temasını AÇ
# ═══════════════════════════════════════════════════════════════════════════
# Bu script yılbaşı temasını tekrar aktif eder.
# Kullanım: npm run theme:on
# ═══════════════════════════════════════════════════════════════════════════

CONFIG_FILE="components/NewYearTheme/config.ts"

if [ -f "$CONFIG_FILE" ]; then
    # THEME_OVERRIDE = * → "on"
    sed -i '' 's/export const THEME_OVERRIDE: ThemeOverride = "[a-z]*";/export const THEME_OVERRIDE: ThemeOverride = "on";/g' "$CONFIG_FILE"
    echo "✅ Yılbaşı teması AÇILDI!"
    echo "📁 Değiştirilen dosya: $CONFIG_FILE"
    echo ""
    echo "Kapatmak için: npm run theme:off"
else
    echo "❌ Hata: $CONFIG_FILE bulunamadı!"
    exit 1
fi
